import { Auth, PrismaClient } from "@prisma/client";

export default class AuthDataBus {

  static prisma = new PrismaClient();

  static async InsertAuth(userAuth: Auth) {
    return await this.prisma.auth.create( { data: userAuth });
  }

  static async SelectAuthById(userId: number) {
    return await this.prisma.auth.findFirstOrThrow( { where: { user_id: userId } });
  }

  static async DeleteAuthById(userId: number) {
    return await this.prisma.auth.findFirstOrThrow( { where: { user_id: userId } });
  }

}
