import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

/** fixed 모달을 body에 렌더 — glass/transform 부모 스택 컨텍스트 회피 */
export function ModalPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
