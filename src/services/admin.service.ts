import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";

type CreateReportInput = {
  reason: "SPAM" | "ABUSE" | "HARASSMENT" | "MISINFORMATION" | "OTHER";
  details?: string;
  postId?: string;
  commentId?: string;
};

type ResolveReportInput = {
  action: "dismiss" | "delete_post" | "delete_comment";
};

export async function createReport(reporterId: string, input: CreateReportInput) {
  if (!input.postId && !input.commentId) {
    throw new AppError("A report must target a post or a comment", 400);
  }

  if (input.postId && input.commentId) {
    throw new AppError("A report can only target one resource at a time", 400);
  }

  return prisma.report.create({
    data: {
      reporterId,
      reason: input.reason,
      details: input.details,
      postId: input.postId,
      commentId: input.commentId
    }
  });
}

export async function listReports() {
  return prisma.report.findMany({
    include: {
      reporter: {
        select: {
          id: true,
          username: true
        }
      },
      post: true,
      comment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function resolveReport(adminId: string, reportId: string, input: ResolveReportInput) {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId
    }
  });

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  if (input.action === "delete_post" && report.postId) {
    await prisma.post.delete({
      where: {
        id: report.postId
      }
    });
  }

  if (input.action === "delete_comment" && report.commentId) {
    await prisma.comment.delete({
      where: {
        id: report.commentId
      }
    });
  }

  return prisma.report.update({
    where: {
      id: reportId
    },
    data: {
      isResolved: true,
      resolvedById: adminId
    }
  });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      isActive
    }
  });
}

export async function validateCoach(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "COACH") {
    throw new AppError("Only coach accounts can be validated", 400);
  }

  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      isCoachValidated: true
    }
  });
}

export async function deletePostAsAdmin(postId: string) {
  return prisma.post.delete({
    where: {
      id: postId
    }
  });
}

export async function deleteCommentAsAdmin(commentId: string) {
  return prisma.comment.delete({
    where: {
      id: commentId
    }
  });
}
