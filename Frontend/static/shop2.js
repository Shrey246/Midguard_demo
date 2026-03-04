document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL SELECTORS ---
    const body = document.querySelector('body');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('backdrop');

    // --- 2. SIDEBAR LOGIC (FINAL, CORRECTED VERSION) ---
    if (sidebar) {
        const toggle = sidebar.querySelector(".toggle");
        const menuBtn = document.getElementById('menuBtn');

        const toggleSidebar = () => {
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // On mobile, use '.open' for overlay
                sidebar.classList.remove('close'); // Remove desktop class
                sidebar.classList.toggle('open');
                if (backdrop) backdrop.classList.toggle('active');
                body.classList.toggle('modal-open');
            } else {
                // On desktop, use '.close' for push
                sidebar.classList.remove('open'); // Remove mobile class
                sidebar.classList.toggle('close');
            }
        };

        toggle?.addEventListener('click', toggleSidebar);
        menuBtn?.addEventListener('click', toggleSidebar);
        backdrop?.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) toggleSidebar();
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && sidebar.classList.contains("open")) toggleSidebar();
        });
    }

    // --- 3. UNIFIED DARK MODE LOGIC ---
    if (sidebar) {
        const modeSwitch = sidebar.querySelector(".toggle-switch");
        const modeText = sidebar.querySelector(".mode-text");
        const themeRadios = document.querySelectorAll('input[name="theme-option"]');

        const setTheme = (theme) => {
            const isDark = theme === 'dark';
            body.classList.toggle("dark", isDark);
            if(modeText) modeText.innerText = isDark ? "Light mode" : "Dark mode";
            localStorage.setItem("theme", theme);
            const radioToSelect = document.getElementById(`theme-${theme}`);
            if (radioToSelect) radioToSelect.checked = true;
        };

        modeSwitch?.addEventListener("click", () => {
            const newTheme = body.classList.contains("dark") ? "light" : "dark";
            setTheme(newTheme);
        });

        themeRadios.forEach(radio => {
            radio.addEventListener('change', (event) => setTheme(event.target.value));
        });

        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
    }

    // --- 4. NAVBAR SCROLL EFFECT ---
    const topNavbar = document.querySelector('.top-navbar');
    const homeContent = document.querySelector('.home');
    if (topNavbar && homeContent) {
        homeContent.addEventListener('scroll', () => {
            topNavbar.classList.toggle('scrolled', homeContent.scrollTop > 10);
        });
    }

    // --- 5. PRODUCT FILTER LOGIC (Shop Page) ---
    const filterContainer = document.querySelector('.filter-container');
    if (filterContainer) {
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const filter = button.dataset.filter;
                productCards.forEach(card => {
                    card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
                });
            });
        });
    }
    
    // --- 6. QUICK VIEW MODAL LOGIC (Shop Page) ---
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const modalImage = modal.querySelector('.modal-image img');
        const modalProductName = document.getElementById('modalProductName');
        const modalProductPrice = document.getElementById('modalProductPrice');

        const openModal = (card) => {
            modalProductName.textContent = card.dataset.name;
            modalProductPrice.textContent = card.dataset.price;
            modalImage.src = card.dataset.img;
            modalImage.alt = card.dataset.name;
            modal.classList.add('active');
            if (backdrop) backdrop.classList.add('active');
            body.classList.add('modal-open');
        };

        const closeModal = () => {
            modal.classList.remove('active');
            if (backdrop && !sidebar?.classList.contains('open')) {
                backdrop.classList.remove('active');
                body.classList.remove('modal-open');
            }
        };

        document.addEventListener('click', (e) => {
            const quickViewBtn = e.target.closest('.quick-view-btn');
            if (quickViewBtn) {
                const productCard = quickViewBtn.closest('.product-card');
                openModal(productCard);
            }
        });
        
        modalCloseBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', () => {
            if (modal.classList.contains('active')) closeModal();
        });
    }

    // --- 7. BUTTON INTERACTIVITY (Wishlist & Add to Cart) ---
    document.addEventListener('click', (e) => {
        // Wishlist Button
        const wishlistBtn = e.target.closest('.wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.classList.toggle('active');
            const heartIcon = wishlistBtn.querySelector('i.bx');
            heartIcon?.classList.toggle('bxs-heart');
            heartIcon?.classList.toggle('bx-heart');
        }

        // Add to Cart Button
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn && !addToCartBtn.classList.contains('is-added')) {
            addToCartBtn.classList.add('is-added');
            setTimeout(() => addToCartBtn.classList.remove('is-added'), 2000);
        }
    });

    // --- LOGIC FOR PRODUCT PAGE INTERACTIVE GALLERY ---

// --- LOGIC FOR INTERACTIVE PRODUCT GALLERY ---
const mainImageDisplay = document.querySelector('.thumbnail');
const thumbnails = document.querySelectorAll('.thumbnail');

// Check if the gallery elements exist on the page before running
if (mainImageDisplay && thumbnails.length > 0) {
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remove the 'active' class from all thumbnails
            thumbnails.forEach(item => item.classList.remove('active'));
            
            // Add the 'active' class to the one you clicked
            this.classList.add('active');
            
            // Update the main display's text and background color
            // based on the clicked thumbnail's content and data-color
            mainImageDisplay.textContent = this.textContent;
            mainImageDisplay.style.backgroundColor = this.dataset.color;
        });
    });
}

    // --- 9. CART PAGE LOGIC (+/-, Remove, Price Update) ---
    const cartPage = document.querySelector('.cart-page');
    if (cartPage) {
        const cartItemsList = cartPage.querySelector('.cart-items-list');
        const subtotalEl = document.getElementById('cart-subtotal');
        const shippingEl = document.getElementById('cart-shipping');
        const totalEl = document.getElementById('cart-total');
        const emptyCartEl = cartPage.querySelector('.empty-state-container');

        const updateCartTotals = () => {
            const cartItems = cartItemsList.querySelectorAll('.cart-item');
            let subtotal = 0;
            
            if (cartItems.length === 0) {
                cartItemsList.querySelector('h2').style.display = 'none';
                if(emptyCartEl) emptyCartEl.classList.remove('hidden');
            } else {
                cartItemsList.querySelector('h2').style.display = 'block';
                if(emptyCartEl) emptyCartEl.classList.add('hidden');
            }

            cartItems.forEach(item => {
                const price = parseFloat(item.dataset.price);
                const quantity = parseInt(item.querySelector('.quantity-input').value);
                subtotal += price * quantity;
            });

            const shippingCost = parseFloat(shippingEl.textContent.replace('₹', ''));
            const total = subtotal + shippingCost;

            subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
            totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
        };

        cartItemsList.addEventListener('click', (e) => {
            const input = e.target.parentElement?.querySelector('.quantity-input');
            if (e.target.classList.contains('quantity-btn') && input) {
                let currentValue = parseInt(input.value);
                if (e.target.classList.contains('plus')) currentValue++;
                else if (e.target.classList.contains('minus')) currentValue = Math.max(1, currentValue - 1);
                input.value = currentValue;
                updateCartTotals();
            }
            if (e.target.classList.contains('remove-btn')) {
                e.target.closest('.cart-item')?.remove();
                updateCartTotals();
            }
        });
        updateCartTotals(); // Initial calculation
    }

    // --- 10. CREATE ROOM PAGE LOGIC (Image Preview) ---
    const createRoomForm = document.querySelector('.create-room-form');
    if (createRoomForm) {
        const fileInputs = createRoomForm.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', function handleFileChange() {
                const placeholder = this.parentElement;
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        placeholder.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        placeholder.appendChild(img);
                        const removeBtn = document.createElement('div');
                        removeBtn.classList.add('remove-image-btn');
                        removeBtn.innerHTML = '<i class="bx bx-x"></i>';
                        placeholder.appendChild(removeBtn);
                        removeBtn.addEventListener('click', () => {
                            placeholder.innerHTML = '<span><i class="bx bx-image-add"></i></span>';
                            const newInput = document.createElement('input');
                            newInput.type = 'file';
                            newInput.accept = 'image/*';
                            placeholder.prepend(newInput);
                            newInput.addEventListener('change', handleFileChange);
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    // --- 11. POLICY PAGE LOGIC (Tabs) ---
    const tabsContainer = document.querySelector('.tabs-container');
    if (tabsContainer) {
        const tabs = tabsContainer.querySelectorAll(".tab-btn");
        const contents = document.querySelectorAll(".policy-card");

        const activateTab = (tabId) => {
            if (!tabId) return;
            contents.forEach(content => content.classList.toggle("active", content.id === tabId));
            tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.target === tabId));
        };
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                history.pushState(null, null, `#${tab.dataset.target}`);
                activateTab(tab.dataset.target);
            });
        });
        const initialTabId = window.location.hash.substring(1);
        if (initialTabId) activateTab(initialTabId);
        else if (tabs.length > 0) activateTab(tabs[0].dataset.target); // Activate first tab by default
    }

    // --- 12. SCROLL FADE-IN ANIMATIONS ---
    const animatedElements = document.querySelectorAll('.hero-section, .filter-container, .product-card, .site-footer, .product-layout, .description-card, .product-suggestions');
    if (animatedElements.length > 0) {
        animatedElements.forEach(el => el.classList.add('fade-in'));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }
});
// --- LOGIC FOR WISHLIST PAGE ---
document.addEventListener('DOMContentLoaded', () => {
    const watchlistGrid = document.querySelector('.watchlist-grid');
    if (!watchlistGrid) return; // Only run if on the watchlist page

    watchlistGrid.addEventListener('click', function(event) {
        const removeBtn = event.target.closest('.remove-btn');
        if (removeBtn) {
            const cardToRemove = removeBtn.closest('.product-card');
            
            // Add animation class
            cardToRemove.classList.add('removing');
            
            // Wait for animation to finish, then remove the element
            cardToRemove.addEventListener('transitionend', () => {
                cardToRemove.remove();
            });
        }
    });
});
// --- LOGIC FOR FUTURISTIC PAYMENT PAGE ---
document.addEventListener('DOMContentLoaded', () => {
    const paymentPage = document.querySelector('.payment-page');
    if (!paymentPage) return; // Only run on payment page

    const methodCards = paymentPage.querySelectorAll('.method-card');
    const contentPanels = paymentPage.querySelectorAll('.payment-method-content');
    const payNowBtn = paymentPage.querySelector('.pay-now-btn');
    const verifyUpiBtn = document.getElementById('verifyUpiBtn');

    // Tab selection logic
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            // Deactivate all
            methodCards.forEach(c => c.classList.remove('active'));
            contentPanels.forEach(p => p.classList.remove('active'));

            // Activate clicked
            card.classList.add('active');
            const targetPanel = document.getElementById(card.dataset.target);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            validatePayment(); // Check validation after selection
        });
    });

    // UPI Verify button animation
    verifyUpiBtn?.addEventListener('click', () => {
        verifyUpiBtn.classList.add('loading');
        // Simulate a network request
        setTimeout(() => {
            verifyUpiBtn.classList.remove('loading');
        }, 2000);
    });

    // Basic validation to enable Pay Now button
    const validatePayment = () => {
        // For this example, we'll enable the button if any option is selected.
        // In a real app, you would add more detailed input validation here.
        const activeCard = paymentPage.querySelector('.method-card.active');
        payNowBtn.disabled = !activeCard;
    };
    
    // Initial check
    validatePayment();
});