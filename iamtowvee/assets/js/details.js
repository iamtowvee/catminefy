document.querySelectorAll('.detail').forEach(details => {
  const content = details.querySelector('.detail-content');
  let isAnimating = false;

  details.addEventListener('toggle', (e) => {
    if (isAnimating) return;
    isAnimating = true;

    const isOpen = details.open;

    if (isOpen) {
      // Открываем
      content.style.maxHeight = '0px';
      content.style.opacity = '0';
      content.style.display = 'block';
      
      // Форсируем перерисовку (двойной rAF)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const height = content.scrollHeight;
          content.style.maxHeight = height + 'px';
          content.style.opacity = '1';
          
          setTimeout(() => {
            content.style.maxHeight = 'none';
            isAnimating = false;
          }, 500);
        });
      });
    } else {
      // Закрываем
      const height = content.scrollHeight;
      content.style.maxHeight = height + 'px';
      content.style.opacity = '1';
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          content.style.maxHeight = '0px';
          content.style.opacity = '0';
          
          setTimeout(() => {
            content.style.display = 'none';
            isAnimating = false;
          }, 500);
        });
      });
    }
  });
});