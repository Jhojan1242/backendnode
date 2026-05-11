import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

import { env } from "@/configs/env";
import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";
import { AuthenticatedUser } from "@/types/auth.types";

type RegisterInput = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: "RUNNER" | "COACH";
};

type LoginInput = {
  emailOrUsername: string;
  password: string;
};

type AuthResponse = {
  token: string;
  user: AuthenticatedUser;
};

const authUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  isActive: true,
  isCoachValidated: true,
  createdAt: true,
  updatedAt: true
} as const;


function signAccessToken(user: Pick<AuthenticatedUser, "id" | "email" | "role">) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET as Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    }
  );
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }]
    },
    select: {
      email: true,
      username: true
    }
  });

  if (existingUser?.email === input.email) {
    throw new AppError("Email is already in use", 409);
  }

  if (existingUser?.username === input.username) {
    throw new AppError("Username is already in use", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const role = input.role ?? "RUNNER";

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
      role,
      isCoachValidated: role === "COACH" ? false : true,
      profile: {
        create: {
          firstName: input.firstName,
          lastName: input.lastName
        }
      }
    },
    select: authUserSelect
  });

  return {
    token: signAccessToken(user),
    user
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const normalizedValue = input.emailOrUsername.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedValue }, { username: normalizedValue }]
    },
    select: {
      ...authUserSelect,
      passwordHash: true
    }
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account is inactive", 403);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;

  return {
    token: signAccessToken(safeUser),
    user: safeUser
  };
}

export async function getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: authUserSelect
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
