import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

function buildTargetUrl(path: string[], request: NextRequest) {
  const target = new URL(`${FASTAPI_BASE_URL}/${path.join("/")}`);
  target.search = request.nextUrl.search;
  return target;
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  return headers;
}

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const target = buildTargetUrl(context.params.path, request);
  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  try {
    const upstream = await fetch(target, {
      method,
      headers: copyRequestHeaders(request),
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-length");
    responseHeaders.delete("content-encoding");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        detail: "FastAPI backend is unavailable",
        status: "unhealthy",
      },
      { status: 503 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxy(request, context);
}
