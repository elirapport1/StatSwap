export function parseColumnFromCellId(cellId: string): string {
    // e.g. "Derek Fisher-Career Minutes  " => "Derek Fisher"
    return cellId.split('-')[0].trim();
  }
  