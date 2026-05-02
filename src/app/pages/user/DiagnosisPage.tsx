import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Loader, ArrowLeft, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../utils/apiConfig';

interface DiagnosisPageProps {
  onNavigate: (page: string) => void;
  onComplete: (results: CFResult[]) => void;
}

type CFResult = {
  category: string;
  score: number;
  percentage: number;
};

// Opsi jawaban berdasarkan skala Likert/CF User
const scaleOptions = [
  { value: '0', label: 'Tidak Pernah' },
  { value: '0.4', label: 'Mungkin' },
  { value: '0.6', label: 'Kemungkinan Besar' },
  { value: '0.8', label: 'Hampir Pasti' },
  { value: '1.0', label: 'Pasti' },
];

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({ onNavigate, onComplete }) => {
  const { symptoms, currentUser: user } = useApp(); // Ambil data gejala asli dari Database via Context
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({}); // Simpan jawaban: { symptom_id: nilai_user }
  const [isLoading, setIsLoading] = useState(false);

  // 1. Kelompokkan Kategori secara Dinamis agar sinkron dengan Admin
  const categories = useMemo(() => [
    { id: 'cat1', title: 'Gangguan Tidur & Keluhan Fisik', color: '#93c5fd' },
    { id: 'cat2', title: 'Gangguan Emosi & Afektif', color: '#86efac' },
    { id: 'cat3', title: 'Penurunan Motivasi & Aktivitas', color: '#ddd6fe' },
    { id: 'cat4', title: 'Kecemasan', color: '#fde68a' },
    { id: 'cat5', title: 'Kepercayaan Diri & Penyesuaian Sosial', color: '#fbcfe8' },
  ], []);

  const currentCategory = categories[currentCategoryIndex];
  
  // 2. Filter Gejala yang Muncul hanya untuk kategori aktif
  const currentSymptoms = useMemo(() => 
    symptoms.filter(s => s.category === currentCategory.title),
  [symptoms, currentCategory]);

  useEffect(() => {
    console.log('Gejala yang diambil dari backend:', symptoms);
    console.log('Gejala untuk kategori saat ini:', currentSymptoms);
  }, [symptoms, currentSymptoms]);

  if (symptoms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Menjemput data gejala dari server...</p>
        </div>
      </div>
    );
  }

  // Hitung Progres
  const answeredInCategory = currentSymptoms.filter(s => userAnswers[s.id] !== undefined).length;
  const isCategoryComplete = answeredInCategory === currentSymptoms.length;
  const totalProgress = (Object.keys(userAnswers).length / symptoms.length) * 100;

  // 3. Logika Perhitungan Certainty Factor (CF)
  const calculateFinalCF = () => {
    const rules = [
      { category: 'Gangguan Tidur & Keluhan Fisik', codes: ['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08'] },
      { category: 'Gangguan Emosi & Afektif', codes: ['G09', 'G10', 'G11', 'G12', 'G13', 'G14', 'G15', 'G16'] },
      { category: 'Penurunan Motivasi & Aktivitas', codes: ['G17', 'G18', 'G19', 'G20', 'G21', 'G22', 'G23', 'G24'] },
      { category: 'Kecemasan', codes: ['G25', 'G26', 'G27', 'G28', 'G29', 'G30', 'G31', 'G32'] },
      { category: 'Kepercayaan Diri & Penyesuaian Sosial', codes: ['G33', 'G34', 'G35', 'G36', 'G37', 'G38', 'G39', 'G40'] },
    ];

    const finalResults = rules.map(rule => {
      const relevantSymptoms = symptoms.filter(s => rule.codes.includes(s.code));
      let cfCombine = 0;

      relevantSymptoms.forEach(symptom => {
        const userValue = userAnswers[symptom.id] || 0; // CF_user
        const expertValue = symptom.weight; // CF_expert

        const cfNew = userValue * expertValue; // CF_rule

        // Combine CF values
        if (cfNew > 0) {
          cfCombine = cfCombine + cfNew * (1 - cfCombine);
        }
      });

      return {
        category: rule.category,
        score: cfCombine,
        percentage: Math.round(cfCombine * 100),
      };
    });

    // Sort results by highest percentage
    return finalResults.sort((a, b) => b.percentage - a.percentage);
  };

  const handleNext = async () => {
    // Jika belum kategori terakhir, lanjut ke kategori berikutnya
    if (currentCategoryIndex < categories.length - 1) {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setCurrentCategoryIndex(prev => prev + 1);
      setIsLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    // Jika kategori terakhir, hitung hasil & (opsional) simpan ke backend
    setIsLoading(true);
    const results = calculateFinalCF();

    try {
      const payload = {
        user_id: user?.id,
        diagnosis_result: results[0]?.category,
        total_score: results[0]?.percentage,
        full_results: results,
      };

      console.log('Payload being sent to API:', payload);

      const response = await fetch(`${API_BASE_URL}/diagnoses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Diagnosa berhasil dihitung!');
      } else {
        console.error('Gagal simpan diagnosa. Status:', response.status);
      }
    } catch (error) {
      console.error('Gagal simpan diagnosa (offline mode)', error);
    } finally {
      setIsLoading(false);
    }

    // Apapun kondisi backend, tetap tampilkan hasil
    onComplete(results);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin text-[#93c5fd] mx-auto" />
          <p className="text-gray-600 font-medium">Menganalisis jawabanmu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      {/* Progress Bar Atas */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
        <div 
          className="h-full bg-blue-500 transition-all duration-500" 
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
          Kategori {currentCategoryIndex + 1} / {categories.length}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentCategory.title}</h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Silakan pilih sejauh mana kondisi di bawah ini menggambarkan perasaanmu
        </p>
      </div>

      {/* Daftar Pertanyaan Gejala */}
      <div className="space-y-4 pb-10">
  {currentSymptoms.map((symptom) => (
    <Card key={symptom.id} className="border-2 border-gray-100 shadow-sm">
      <CardContent className="p-5">
        <p className="text-gray-800 font-medium mb-4 whitespace-normal leading-relaxed">
          {symptom.text}
        </p>
        
        <RadioGroup
          value={userAnswers[symptom.id]?.toString() || ""}
          onValueChange={(val) => {
            console.log('Selected value:', val); // Log the selected value
            setUserAnswers((prev) => ({
              ...prev,
              [symptom.id]: parseFloat(val), // Ensure parseFloat works correctly
            }));
            toast.success("Jawaban tersimpan!"); // Tampilkan notifikasi saat jawaban dipilih
          }}
          className="grid grid-cols-1 md:grid-cols-5 gap-2"
        >
          {scaleOptions.map((opt) => (
            <div 
              key={opt.value} 
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 border border-gray-300 hover:border-gray-400 transition-all w-full md:w-40"
              style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
            >
              <input 
                type="radio" 
                id={`s-${symptom.id}-${opt.value}`} 
                name={`s-${symptom.id}`} 
                value={opt.value} 
                checked={userAnswers[symptom.id.toString()] === parseFloat(opt.value)}
                onChange={(e) => {
                  const val = e.target.value; // Extract value from event
                  console.log('Selected value:', val); // Log the selected value
                  setUserAnswers((prev) => ({
                    ...prev,
                    [symptom.id.toString()]: parseFloat(val), // Ensure ID is treated as a string
                  }));
                  toast.success("Jawaban tersimpan!");
                }}
                className="hidden"
              />
              <Label 
                htmlFor={`s-${symptom.id}-${opt.value}`} 
                className="text-xs cursor-pointer flex items-center justify-between w-full"
              >
                <span className="flex items-center">
                  {userAnswers[symptom.id.toString()] === parseFloat(opt.value) && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  )}
                  {opt.label}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  ))}
</div>

      {/* Navigasi Bawah */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 border-t fixed bottom-0 left-0 w-full md:relative md:bg-transparent md:border-0 md:p-0">
        <Button
          variant="ghost"
          onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
          disabled={currentCategoryIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>

        <div className="text-xs text-gray-400 font-medium">
          {answeredInCategory} / {currentSymptoms.length} Terjawab
        </div>

        <Button
          onClick={handleNext}
          disabled={!isCategoryComplete}
          className={`gap-2 px-8 ${isCategoryComplete ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
        >
          {currentCategoryIndex === categories.length - 1 ? (
            <>Selesai <CheckCircle2 className="w-4 h-4" /></>
          ) : (
            <>Lanjut <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
};