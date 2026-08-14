import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@hisabai.com",
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 },
    );
  }
}

export async function PUT() {
  try {
    const user = await prisma.user.update({
      where: {
        id: 1,
      },
      data: {
        name: "Updated Test User",
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const user = await prisma.user.delete({
      where: {
        id: 1,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 },
    );
  }
}
