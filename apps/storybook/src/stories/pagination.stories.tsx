import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@masmeert/ui/pagination";

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function visiblePages(page: number, pageCount: number): (number | "start-gap" | "end-gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "end-gap", pageCount];
  if (page >= pageCount - 3)
    return [1, "start-gap", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  return [1, "start-gap", page - 1, page, page + 1, "end-gap", pageCount];
}

function ThreadListPagination({
  pageCount,
  initialPage,
  ...props
}: ComponentProps<typeof Pagination> & { pageCount: number; initialPage: number }) {
  const [page, setPage] = useState(initialPage);

  return (
    <Pagination {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setPage(Math.max(1, page - 1));
            }}
          />
        </PaginationItem>
        {visiblePages(page, pageCount).map((entry) =>
          typeof entry === "string" ? (
            <PaginationItem key={entry}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href="#"
                isActive={entry === page}
                onClick={(event) => {
                  event.preventDefault();
                  setPage(entry);
                }}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === pageCount}
            className={page === pageCount ? "pointer-events-none opacity-50" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setPage(Math.min(pageCount, page + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export const FirstPage: Story = {
  render: (args) => <ThreadListPagination {...args} pageCount={20} initialPage={1} />,
};

export const MiddlePage: Story = {
  render: (args) => <ThreadListPagination {...args} pageCount={20} initialPage={9} />,
};

export const FewPages: Story = {
  render: (args) => <ThreadListPagination {...args} pageCount={5} initialPage={2} />,
};
