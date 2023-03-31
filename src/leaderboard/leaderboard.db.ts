import { User, PrismaClient } from "@prisma/client";

export default class LeaderboardDataBus {
  
  static prisma = new PrismaClient();

  static async GetTopScoresGlobal() {
    return await this.prisma.user.findMany({ select: { username: true, lesson_current: true }, orderBy: { lesson_current: "desc" }, take: 5 });
  }
  
  static async GetTopScoresClass(classCode: string) {
    return await this.prisma.user.findMany({ select: { username: true, lesson_current: true }, where: { verification_value: { equals: classCode } }, orderBy: { lesson_current: "desc" }, take: 5});
  }

}