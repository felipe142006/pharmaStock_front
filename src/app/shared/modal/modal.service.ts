import { Injectable } from '@angular/core';
import {
  NgbModal,
  NgbModalConfig,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable({ providedIn: 'root' })
export class ModalService {
  public modalRef: NgbModalRef | null = null;

  constructor(config: NgbModalConfig, private modalService: NgbModal) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  open(content: any, size = 'md', scroll = true, centered = false): void {
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size,
      scrollable: scroll,
      centered,
    });
  }

  close(): void {
    this.modalService.dismissAll();
  }
}
