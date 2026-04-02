export const getRiskLevel = (percentage: number) => {
  if (percentage <= 25) {
    return {
      level: "Tidak Terindikasi",
      color: "text-green-600",
      desc: "Kondisi stabil, tidak ditemukan gejala signifikan."
    };
  } else if (percentage <= 50) {
    return {
      level: "Ringan",
      color: "text-blue-600",
      desc: "Terdapat indikasi gangguan minor, disarankan monitoring mandiri."
    };
  } else if (percentage <= 75) {
    return {
      level: "Sedang",
      color: "text-yellow-600",
      desc: "Gangguan cukup jelas, membutuhkan perhatian atau konseling."
    };
  } else {
    return {
      level: "Berat",
      color: "text-red-600",
      desc: "Risiko tinggi, sangat disarankan konsultasi ke profesional/psikolog."
    };
  }
};