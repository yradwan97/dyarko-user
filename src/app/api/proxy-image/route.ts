import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  console.log("🖼️ Proxy image request:", {
    url: imageUrl,
    hasSession: !!session,
    hasUser: !!session?.user,
    hasAccessToken: !!session?.user?.accessToken,
  });

  try {
    const headers: HeadersInit = {
      "Content-Type": "image/*",
    };

    // Add authorization if user is authenticated
    if (session?.user?.accessToken) {
      headers.Authorization = `Bearer ${session.user.accessToken}`;
      console.log("✅ Adding auth header to image request");
    } else {
      console.log("⚠️ No access token found in session");
    }

    const imageResponse = await fetch(imageUrl, { headers });

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageUrl}, status: ${imageResponse.status}`);
      return new NextResponse("Failed to fetch image", {
        status: imageResponse.status,
      });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
