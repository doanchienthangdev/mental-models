"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

type TocItem = {
  id: string;
  label: string;
  level: number;
};

type TableOfContentProps = {
  items: TocItem[];
};

type TocNode = TocItem & { children: TocNode[] };

const SCROLL_OFFSET = 90;

const truncateLabel = (label: string, limit = 8) => {
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length <= limit) return label;
  return `${words.slice(0, limit).join(" ")}…`;
};

const buildTree = (items: TocItem[]) => {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  items.forEach((item) => {
    const node: TocNode = { ...item, children: [] };

    while (stack.length && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    } else {
      roots.push(node);
    }

    stack.push(node);
  });

  return roots;
};

export function TableOfContent({ items }: TableOfContentProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const headingIds = useMemo(() => items.map((item) => item.id), [items]);
  const tree = useMemo(() => buildTree(items), [items]);

  const parentLookup = useMemo(() => {
    const map = new Map<string, string | null>();
    const traverse = (nodes: TocNode[], parentId: string | null) => {
      nodes.forEach((node) => {
        map.set(node.id, parentId);
        if (node.children.length > 0) {
          traverse(node.children, node.id);
        }
      });
    };
    traverse(tree, null);
    return map;
  }, [tree]);

  useEffect(() => {
    const defaults = new Set<string>();
    tree.forEach((node) => {
      if (node.children.length > 0) {
        defaults.add(node.id);
      }
    });
    setOpenIds(defaults);
  }, [tree]);

  useEffect(() => {
    if (headingIds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const nextTarget = visible[0] ??
          entries.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
        if (nextTarget) {
          setActiveId(nextTarget.target.id);
        }
      },
      {
        rootMargin: `-${SCROLL_OFFSET + 10}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headingIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setActiveId(hash);
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      let current: string | null | undefined = activeId;
      while (current) {
        next.add(current);
        current = parentLookup.get(current) ?? null;
      }
      return next;
    });
  }, [activeId, parentLookup]);

  const handleClick = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      if (window.history.replaceState) {
        window.history.replaceState(null, "", `#${id}`);
      } else {
        window.location.hash = id;
      }
    }
  }, []);

  const toggleNode = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const renderNodes = useCallback(
    (nodes: TocNode[], depth = 0) =>
      nodes.map((node) => {
        const isActive = activeId === node.id;
        const hasChildren = node.children.length > 0;
        const isOpen = openIds.has(node.id);
        const truncated = truncateLabel(node.label);

        return (
          <div key={node.id} className="space-y-1">
            <button
              type="button"
              onClick={() => handleClick(node.id)}
              className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-xs transition ${
                isActive ? "bg-[#14354a] text-white" : "text-white/50 hover:text-white hover:bg-[#132836]"
              }`}
              style={{ paddingLeft: depth === 0 ? 12 : 16 + (depth - 1) * 12 }}
              title={node.label}
            >
              <span className="flex-1 text-left leading-snug line-clamp-2 text-[13px]">
                {truncated}
              </span>
              {hasChildren && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleNode(node.id);
                  }}
                  className={`ml-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 text-white/60 transition ${
                    isOpen ? "rotate-90 text-white" : ""
                  }`}
                >
                  <ChevronRight className="h-3 w-3" />
                </span>
              )}
            </button>
            {hasChildren && isOpen && <div className="pl-3">{renderNodes(node.children, depth + 1)}</div>}
          </div>
        );
      }),
    [activeId, handleClick, openIds, toggleNode],
  );

  if (items.length === 0) {
    return <p className="text-xs text-slate-500">No headings detected.</p>;
  }

  return <nav className="space-y-1">{renderNodes(tree)}</nav>;
}
