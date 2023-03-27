import { PrismaClient, User } from "@prisma/client";

export default class UsersDataBus {
  static prisma = new PrismaClient();

  static async SelectUserById(userId: number) {
    return await this.prisma.user.findFirstOrThrow({ where: { id: userId } });
  }

  static async SelectUserByUsername(username: string) {
    return await this.prisma.user.findFirstOrThrow({ where: { username: username } });
  }

  static async InsertUser(user: User) {
    return await this.prisma.user.create({ data: user });
  }

  static async DeleteUserById(userId: number) {
    return await this.prisma.user.delete({ where: { id: userId } });
  }
}
