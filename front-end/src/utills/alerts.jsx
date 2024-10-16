export function showAlert(type, message) {
  const divAlert = document.getElementById('alert-message');
  if (!divAlert) {
    console.error(`[eletConnect]: A div com o id 'alert-message' não foi encontrada. Certifique-se de que ela existe no seu HTML.`);
    return;
  }

  const alertElement = document.createElement('div');
  alertElement.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
  divAlert.appendChild(alertElement);

  setTimeout(() => {
    divAlert.removeChild(alertElement);
  }, 4000);
}
