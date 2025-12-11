import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { vi } from "vitest";
import { ArticleImageUploader } from "@/components/admin/article-image-uploader";
import { useState } from "react";

const uploadTasks = vi.hoisted(
  () =>
    [] as Array<{ progress?: (snapshot: { bytesTransferred: number; totalBytes: number }) => void; complete?: () => void }>,
);
const mockEnsureAnonAuth = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/lib/firebase/client", () => ({
  storage: {},
  ensureAnonAuth: mockEnsureAnonAuth,
}));

vi.mock("firebase/storage", () => {
  const ref = vi.fn((_storage, path) => ({ path }));
  const uploadBytesResumable = vi.fn((_ref, file: File) => {
    const callbacks: { progress?: (snapshot: { bytesTransferred: number; totalBytes: number }) => void; complete?: () => void } = {};
    const task = {
      snapshot: { ref: { url: `https://storage.test/${file.name}` } },
      on: (_event: string, progress: typeof callbacks.progress, _error: unknown, complete: typeof callbacks.complete) => {
        callbacks.progress = progress;
        callbacks.complete = complete;
      },
    };
    uploadTasks.push(callbacks);
    return task;
  });
  const getDownloadURL = vi.fn(async (ref: { url?: string }) => ref.url ?? "https://storage.test/placeholder.png");
  return { ref, uploadBytesResumable, getDownloadURL };
});

describe("ArticleImageUploader", () => {
  beforeEach(() => {
    uploadTasks.length = 0;
    vi.clearAllMocks();
  });

  it("uploads multiple images with progress and renders them in a grid", async () => {
    const user = userEvent.setup();
    render(<ArticleImageUploader />);

    const input = screen.getByLabelText(/upload article images/i);
    const files = [
      new File(["first"], "first.png", { type: "image/png" }),
      new File(["second"], "second.jpg", { type: "image/jpeg" }),
    ];

    await user.upload(input, files);
    await waitFor(() => expect(uploadTasks.length).toBe(2));
    expect(mockEnsureAnonAuth).toHaveBeenCalled();

    act(() => uploadTasks[0].progress?.({ bytesTransferred: 50, totalBytes: 100 }));

    expect(await screen.findByText("50%")).toBeInTheDocument();

    await act(async () => {
      uploadTasks[0].complete?.();
      uploadTasks[1].complete?.();
    });

    expect(await screen.findByAltText("first.png")).toBeInTheDocument();
    expect(await screen.findByAltText("second.jpg")).toBeInTheDocument();
  });

  it("copies markdown when clicking an image", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
    });

    render(
      <ArticleImageUploader
        initialImages={[
          {
            id: "img-1",
            name: "example.png",
            url: "https://storage.test/example.png",
            progress: 100,
            status: "complete",
          },
        ]}
      />,
    );

    const image = await screen.findByAltText("example.png");
    expect(image).toHaveClass("cursor-pointer");

    await user.click(image);

    expect(writeText).toHaveBeenCalledWith("![example.png](https://storage.test/example.png)");
  });

  it("does not copy markdown if URL is missing", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
    });

    render(
      <ArticleImageUploader
        initialImages={[
          { id: "img-1", name: "pending.png", url: "", progress: 50, status: "uploading" },
        ]}
      />,
    );

    const image = await screen.findByAltText("pending.png");
    await user.click(image);

    expect(writeText).not.toHaveBeenCalled();
    expect(screen.getByText(/please wait for the url/i)).toBeInTheDocument();
  });

  it("removes images from the grid", async () => {
    const user = userEvent.setup();
    render(
      <ArticleImageUploader
        initialImages={[
          { id: "img-1", name: "keep.png", url: "https://storage.test/keep.png", progress: 100, status: "complete" },
          { id: "img-2", name: "remove.png", url: "https://storage.test/remove.png", progress: 100, status: "complete" },
        ]}
      />,
    );

    const removeBtn = await screen.findByRole("button", { name: /remove remove\.png/i });
    await user.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByAltText("remove.png")).not.toBeInTheDocument();
    });
    expect(screen.getByAltText("keep.png")).toBeInTheDocument();
  });

  it("supports parent-managed state without causing rerender loops", async () => {
    const user = userEvent.setup();

    function Parent() {
      const [imgs, setImgs] = useState<ArticleImage[]>([
        { id: "img-1", name: "keep.png", url: "https://storage.test/keep.png", progress: 100, status: "complete" },
        { id: "img-2", name: "remove.png", url: "https://storage.test/remove.png", progress: 100, status: "complete" },
      ]);
      return (
        <>
          <ArticleImageUploader initialImages={imgs} onChange={setImgs} />
          <div data-testid="count">{imgs.length}</div>
        </>
      );
    }

    render(<Parent />);

    const removeBtn = await screen.findByRole("button", { name: /remove remove\.png/i });
    await user.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByAltText("remove.png")).not.toBeInTheDocument();
    });
    expect(screen.getByAltText("keep.png")).toBeInTheDocument();
    expect(screen.getByTestId("count").textContent).toBe("1");
  });
});
