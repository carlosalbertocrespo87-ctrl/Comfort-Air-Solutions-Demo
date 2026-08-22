export type ReceiptProcessingStatus = 'RECEIVED' | 'PROCESSED' | 'IGNORED' | 'FAILED';

export type DuplicateReceiptDecision =
  | 'retry_failed'
  | 'ack_terminal'
  | 'retry_later'
  | 'fail_closed';

export function decideDuplicateReceipt(status: unknown): DuplicateReceiptDecision {
  if (status === 'FAILED') return 'retry_failed';
  if (status === 'PROCESSED' || status === 'IGNORED') return 'ack_terminal';
  if (status === 'RECEIVED') return 'retry_later';
  return 'fail_closed';
}
