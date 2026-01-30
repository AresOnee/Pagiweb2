import { useEffect } from 'preact/hooks';

/** Headless mobile menu controller. Attaches event listeners to Header.astro DOM. Mount with client:load. */
export default function MobileMenu() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const menuBtn = document.querySelector('.mobile-menu-btn') as HTMLButtonElement | null;
    const menu = document.querySelector('.mobile-menu') as HTMLElement | null;

    if (!menuBtn || !menu) return;

    let isOpen = false;

    function openMenu() {
      if (!menu || !menuBtn) return;
      isOpen = true;
      menu.classList.add('active');
      menuBtn.classList.add('active');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (!menu || !menuBtn) return;
      isOpen = false;
      menu.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function handleMenuBtnClick(e: Event) {
      e.stopPropagation();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    function handleDocumentClick(e: Event) {
      if (!isOpen) return;
      const target = e.target as HTMLElement;
      if (!menu!.contains(target) && !menuBtn!.contains(target)) {
        closeMenu();
      }
    }

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    }

    // Attach listeners
    menuBtn.addEventListener('click', handleMenuBtnClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);

    // Close on nav link click inside mobile menu
    const navLinks = menu.querySelectorAll('.nav-link');
    const handleNavClick = () => closeMenu();
    navLinks.forEach((link) => link.addEventListener('click', handleNavClick));

    // Cleanup
    return () => {
      menuBtn.removeEventListener('click', handleMenuBtnClick);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeydown);
      navLinks.forEach((link) => link.removeEventListener('click', handleNavClick));
      // Restore body scroll
      document.body.style.overflow = '';
    };
  }, []);

  return null;
}
