document.addEventListener('DOMContentLoaded', function () {
  const myElement = document.querySelector('#myElement');
  if (myElement) {
    myElement.addEventListener('click', function () {
      console.log('Element geklikt!');
    });
  }
});
