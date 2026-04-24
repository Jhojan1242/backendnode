export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: "RUNNER" | "COACH" | "ADMIN";
  isActive: boolean;
  isCoachValidated: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: AuthenticatedUser["role"];
  iat?: number;
  exp?: number;
};
