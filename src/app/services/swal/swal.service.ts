import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SwalService {

  /**
   * sweetalert para indicar carga en toda la pagina
   */
  showLoading() {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  showSuccessPromise(message: string) {
    return Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  /**
   * sweetalert para indicar que una peticion fue exitosa al usuario
   * @param message 
   */
  showSuccess(message: string) {
    Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  /**
   * sweetalert utilizado para indicarle algo al usuario
   * @param message 
   */
  showInfo(message: string) {
    Swal.fire({
      title: 'Info!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  /**
   * sweetalert utilizado para mostrar un error al usuario
   * @param message 
   */
  showError(message: string) {
    Swal.fire({
      title: '¡Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  /**
   * sweetalert utilizado para mostrar una alerta al usuario
   * @param message 
   */
  showWarning(message: string) {
    Swal.fire({
      title: '¡Ups! Algo salió mal',
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  }

  /**
   * sweetAlert que solicita una confirmacion previa para ejecutar una funcion en especifica
   * @returns 
   */
  showDeleteConfirmation() {
    return Swal.fire({
      title: '¿Estás seguro?',
      text: 'Una vez eliminada, no podrás recuperar esta información.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });
  }
}
