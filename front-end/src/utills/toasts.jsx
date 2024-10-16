export default function showToast(type, message, duration = 4000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error(`[eletConnect]: O container de toasts com o id 'toast-container' não foi encontrado. Certifique-se de que ele existe no seu HTML.`);
        return;
    }

    // Cria um novo elemento de toast
    const toastElement = document.createElement('div');
    toastElement.classList.add('toast');
    toastElement.classList.add('align-items-center');
    toastElement.classList.add(`text-bg-${type}`);
    toastElement.classList.add('border-0');
    toastElement.classList.add('w-100');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    // Define o conteúdo do toast
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    // Adiciona o toast ao container
    toastContainer.appendChild(toastElement);
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 100);

    // Define um timeout para remover automaticamente o toast após o tempo especificado
    setTimeout(() => {
        toastElement.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toastElement);
        }, 400); // Tempo para coincidir com a duração da transição CSS
    }, duration);
}
