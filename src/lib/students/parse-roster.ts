import type { Gender } from "@/types/database";

export type ParsedStudent = {
  studentNum: number;
  name: string;
  gender: Gender | null;
};

export function parseStudentRoster(raw: string): {
  students: ParsedStudent[];
  error?: string;
} {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { students: [], error: "학생 명단을 한 줄 이상 입력해 주세요." };
  }

  const students: ParsedStudent[] = [];
  const seenNums = new Set<number>();

  for (const [index, line] of lines.entries()) {
    // 지원 형식: "1,홍길동" | "1,홍길동,M" | "1 홍길동" | "1\t홍길동\tF"
    const parts = line
      .split(/[,\t|/]/)
      .map((p) => p.trim())
      .filter(Boolean);
    let studentNum: number;
    let name: string;
    let genderRaw: string | undefined;

    if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
      studentNum = Number(parts[0]);
      name = parts[1];
      genderRaw = parts[2];
    } else {
      const spaced = line.split(/\s+/);
      if (spaced.length >= 2 && /^\d+$/.test(spaced[0])) {
        studentNum = Number(spaced[0]);
        name = spaced.slice(1).join(" ");
      } else {
        return {
          students: [],
          error: `${index + 1}번째 줄 형식이 올바르지 않습니다. 예: 1,홍길동,M`,
        };
      }
    }

    if (!name) {
      return { students: [], error: `${index + 1}번째 줄에 이름이 없습니다.` };
    }
    if (seenNums.has(studentNum)) {
      return { students: [], error: `번호 ${studentNum}이(가) 중복됩니다.` };
    }
    seenNums.add(studentNum);

    let gender: Gender | null = null;
    if (genderRaw) {
      const g = genderRaw.toUpperCase();
      if (g === "M" || g === "남" || g === "남자") gender = "M";
      else if (g === "F" || g === "여" || g === "여자") gender = "F";
      else if (g === "OTHER" || g === "기타") gender = "other";
      else {
        return {
          students: [],
          error: `${index + 1}번째 줄 성별은 M/F/other 중 하나여야 합니다.`,
        };
      }
    }

    students.push({ studentNum, name, gender });
  }

  return { students };
}
