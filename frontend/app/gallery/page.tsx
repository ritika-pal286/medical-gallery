"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "../../lib/api";

type GalleryFile = {
  _id: string;
  title: string;
  category: string;
  fileUrl: string;
};

export default function Gallery() {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GalleryFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // ✅ Fetch files
  const fetchFiles = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(apiUrl("/api/files"), {
        cache: "no-store", // 🔥 important
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || data?.message || "Failed to fetch gallery");
      }

      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch gallery data.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  useEffect(() => {
    if (!selectedFile) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedFile]);

  // ✅ Delete file
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setErrorMessage("");
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage("Please login to delete files.");
        return;
      }

      const response = await fetch(apiUrl(`/api/files/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Delete failed");
      }

      fetchFiles(); // refresh
    } catch (error) {
      console.error("Delete error:", error);
      const message = error instanceof Error ? error.message : "Delete failed.";
      setErrorMessage(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenModal = (file: GalleryFile) => {
    setSelectedFile(file);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const markBrokenImage = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFile(null), 200);
  };

  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    files.forEach((file) => {
      if (!file.category) return;
      categoryMap.set(file.category, (categoryMap.get(file.category) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [files]);

  const filteredFiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return files.filter((file) => {
      const matchesTitle = file.title.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "All" || file.category === selectedCategory;

      return matchesTitle && matchesCategory;
    });
  }, [files, searchTerm, selectedCategory]);

  const hasActiveFilters = searchTerm.trim().length > 0 || selectedCategory !== "All";

  const getCategoryBadgeClasses = (category: string) => {
    switch (category) {
      case "Radiology":
        return "bg-cyan-50 text-cyan-700 ring-cyan-200";
      case "Cardiology":
        return "bg-rose-50 text-rose-700 ring-rose-200";
      case "Neurology":
        return "bg-indigo-50 text-indigo-700 ring-indigo-200";
      case "Orthopedics":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Gallery
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse and manage uploaded medical assets.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
          {filteredFiles.length} Files
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Search by title</label>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Filter by category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          >
            <option value="All">All Categories ({files.length})</option>
            {categories.map(([category, count]) => (
              <option key={category} value={category}>
                {category} ({count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
          Loading gallery...
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">
          {errorMessage}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-base font-semibold text-slate-700">No results found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try changing search text or selecting a different category.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map((file) => (
            <div
              key={file._id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              {brokenImages[file._id] ? (
                <button
                  onClick={() => window.open(file.fileUrl, "_blank", "noopener,noreferrer")}
                  className="flex h-44 w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500"
                >
                  Preview unavailable. Open file
                </button>
              ) : (
                <img
                  src={file.fileUrl}
                  alt={file.title}
                  className="h-44 w-full cursor-zoom-in object-cover transition duration-300 group-hover:scale-105"
                  onClick={() => handleOpenModal(file)}
                  onError={() => markBrokenImage(file._id)}
                />
              )}

              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900">
                    {file.title}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getCategoryBadgeClasses(
                      file.category
                    )}`}
                  >
                    {file.category}
                  </span>
                </div>

                {isLoggedIn && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    disabled={deletingId === file._id}
                    className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      deletingId === file._id
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                        : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                  >
                    {deletingId === file._id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 transition-opacity duration-200 ${
            isModalOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition duration-200 ${
              isModalOpen ? "scale-100" : "scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedFile.title}</h3>
                <p className="text-sm text-slate-600">{selectedFile.category}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {selectedFile && brokenImages[selectedFile._id] ? (
              <div className="flex min-h-[40vh] items-center justify-center bg-slate-100 p-6 text-center">
                <a
                  href={selectedFile.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Open Original File
                </a>
              </div>
            ) : (
              <img
                src={selectedFile.fileUrl}
                alt={selectedFile.title}
                className="max-h-[80vh] w-full object-contain bg-slate-100"
                onError={() => selectedFile && markBrokenImage(selectedFile._id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
