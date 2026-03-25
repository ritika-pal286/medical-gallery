"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        setIsAuthChecked(true);
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!title || !category || !file) {
      setUploadError("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("file", file);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Upload failed");
      }

      setUploadSuccess("Uploaded successfully.");

      // reset form
      setTitle("");
      setCategory("");
      setFile(null);

      // reset file input manually
      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error: unknown) {
      console.error("Upload error:", error);
      const message = error instanceof Error ? error.message : "Upload failed.";
      setUploadError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Upload</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add medical files with title and category. Files are uploaded to Cloudinary.
        </p>

        <form onSubmit={handleUpload} className="mt-8 space-y-5">
          {uploadError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {uploadSuccess}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              placeholder="e.g. MRI Brain Scan"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <input
              placeholder="e.g. Radiology"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">File</label>
            <input
              id="fileInput"
              type="file"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 hover:file:bg-slate-200"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            disabled={loading}
            className={`w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
              loading
                ? "cursor-not-allowed bg-slate-400"
                : "bg-cyan-600 hover:-translate-y-0.5 hover:bg-cyan-500"
            }`}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Workflow</h2>
        <div className="mt-5 space-y-4">
          {[
            "Add title and category metadata.",
            "Select the image or file to upload.",
            "Publish and verify in the Gallery tab.",
          ].map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
