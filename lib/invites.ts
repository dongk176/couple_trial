import type { PrismaClient } from "@prisma/client";

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode() {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
  }
  return code;
}

export async function createUniqueInviteCode(db: PrismaClient) {
  let inviteCode = generateInviteCode();

  while (
    (await db.user.findUnique({ where: { inviteCode } })) ||
    (await db.couple.findUnique({ where: { inviteCode } }))
  ) {
    inviteCode = generateInviteCode();
  }

  return inviteCode;
}

export async function ensureUserInviteCode(db: PrismaClient, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { inviteCode: true }
  });

  if (user?.inviteCode) {
    return user.inviteCode;
  }

  const inviteCode = await createUniqueInviteCode(db);
  await db.user.update({
    where: { id: userId },
    data: { inviteCode }
  });

  return inviteCode;
}
