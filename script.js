// WhatsApp number (already provided)
const WA_NUMBER = '917593046852';
// NOTE: You must replace 'YOUR_WEB3FORMS_ACCESS_KEY' with your actual access key
const WEB3FORMS_ACCESS_KEY = '188402d9-6532-4951-9eb6-4993789a731b'; 

/* ---------- Helpers ---------- */
function formatPrice(p){ return '₹ ' + Number(p).toLocaleString('en-IN'); } // Use 'en-IN' for Indian Rupee formatting

/* ---------- Elements ---------- */
const cartBtn = document.getElementById('cart-btn'),
      cartDrawer = document.getElementById('cart-drawer'),
      cartBackdrop = document.getElementById('cart-backdrop'),
      closeCart = document.getElementById('close-cart'),
      cartCount = document.getElementById('cart-count'),
      cartItemsEl = document.getElementById('cart-items'),
      cartSubtotalEl = document.getElementById('cart-subtotal'),
      openCheckoutBtn = document.getElementById('open-checkout'),
      clearCartBtn = document.getElementById('clear-cart');

const checkoutModal = document.getElementById('checkout-modal'),
      checkoutBackdrop = document.getElementById('checkout-backdrop'),
      closeCheckout = document.getElementById('close-checkout'),
      checkoutItemsEl = document.getElementById('checkout-items'),
      checkoutSubtotalEl = document.getElementById('checkout-subtotal'),
      checkoutWhatsapp = document.getElementById('checkout-whatsapp'),
      checkoutCancel = document.getElementById('checkout-cancel');

const leadForm = document.getElementById('lead-form');
const leadResult = document.getElementById('lead-result');
// Get the submit button for disabling
const leadSubmitButton = leadForm ? leadForm.querySelector('button[type="submit"]') : null;

/* ---------- Cart Functions ---------- */
// product button helper
function productFromBtn(btn) {
    return { id: btn.dataset.id, name: btn.dataset.name, price: Number(btn.dataset.price)||0, qty: 1 };
}

// load cart
let cart = JSON.parse(localStorage.getItem('milana_cart') || '[]');

function saveCart(){ localStorage.setItem('milana_cart', JSON.stringify(cart)); renderCart(); }

function addToCart(product){
    const found = cart.find(i=>i.id===product.id);
    if(found) found.qty++;
    else cart.push(product);
    saveCart();
    openCart();
}

function changeQty(id, qty){
    const item = cart.find(i=>i.id===id); if(!item) return;
    item.qty = Math.max(1, qty); saveCart();
}
function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); saveCart(); }

function cartTotal(){ return cart.reduce((s,i)=>s + (i.price * i.qty), 0); }

function renderCart(){
    cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
    cartItemsEl.innerHTML = '';
    if(cart.length===0){
        cartItemsEl.innerHTML = '<p class="text-gray-500">Your cart is empty.</p>';
        openCheckoutBtn.disabled = true;
        clearCartBtn.disabled = true;
    } else {
        openCheckoutBtn.disabled = false;
        clearCartBtn.disabled = false;
        cart.forEach(item=>{
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between';
            row.innerHTML = `
              <div>
                <div class="font-medium text-gray-800">${item.name}</div>
                <div class="text-sm text-gray-500">${formatPrice(item.price)} x ${item.qty}</div>
              </div>
              <div class="flex items-center gap-2">
                <button class="qty-dec px-2 py-1 border rounded" data-id="${item.id}">-</button>
                <div class="w-6 text-center">${item.qty}</div>
                <button class="qty-inc px-2 py-1 border rounded" data-id="${item.id}">+</button>
                <button class="remove-item text-sm text-red-500 ml-2" data-id="${item.id}">Remove</button>
              </div>
            `;
            cartItemsEl.appendChild(row);
        });
    }
    cartSubtotalEl.textContent = formatPrice(cartTotal());
}

// add-to-cart buttons
document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', ()=> addToCart(productFromBtn(btn)));
});

// cart open/close
function openCart(){ cartDrawer.classList.remove('hidden'); document.body.classList.add('hide-scroll'); renderCart(); }
function closeCartFn(){ cartDrawer.classList.add('hidden'); document.body.classList.remove('hide-scroll'); }

cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartFn);
cartBackdrop.addEventListener('click', closeCartFn);

// delegate qty/change/remove inside cart
cartItemsEl.addEventListener('click', (e)=>{
    const dec = e.target.closest('.qty-dec'),
          inc = e.target.closest('.qty-inc'),
          rem = e.target.closest('.remove-item');
    if(dec){ const id = dec.dataset.id; const it = cart.find(i=>i.id===id); if(it) changeQty(id, it.qty-1); }
    else if(inc){ const id = inc.dataset.id; const it = cart.find(i=>i.id===id); if(it) changeQty(id, it.qty+1); }
    else if(rem){ removeFromCart(rem.dataset.id); }
});

clearCartBtn.addEventListener('click', ()=>{ cart = []; saveCart(); });

/* ---------- Checkout Modal Functions ---------- */
// open checkout modal (no payment gate)
openCheckoutBtn.addEventListener('click', ()=> {
    if(cart.length === 0){ 
        // Display a message instead of using alert()
        alert('Your cart is empty. Add items first.');
        return; 
    }
    
    // build checkout list
    checkoutItemsEl.innerHTML = '';
    cart.forEach(i=>{
        const el = document.createElement('div');
        el.className = 'flex items-center justify-between';
        el.innerHTML = `<div class="text-sm">${i.name} x${i.qty}</div><div class="text-sm font-semibold">${formatPrice(i.price * i.qty)}</div>`;
        checkoutItemsEl.appendChild(el);
    });
    checkoutSubtotalEl.textContent = formatPrice(cartTotal());
    checkoutModal.classList.remove('hidden');
    document.body.classList.add('hide-scroll');
});

closeCheckout.addEventListener('click', ()=> { checkoutModal.classList.add('hidden'); document.body.classList.remove('hide-scroll'); });
checkoutBackdrop.addEventListener('click', ()=> { checkoutModal.classList.add('hidden'); document.body.classList.remove('hide-scroll'); });
checkoutCancel.addEventListener('click', ()=> { checkoutModal.classList.add('hidden'); document.body.classList.remove('hide-scroll'); });

// Prepare WhatsApp message and redirect
checkoutWhatsapp.addEventListener('click', ()=> {
    if(cart.length === 0){
        // Ensure no redirect if cart is empty (although button should be disabled)
        return; 
    } 
    
    let message = `Hi Milana Clothing,%0AI'd like to place an order:%0A%0A`;
    cart.forEach(i => { message += `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}%0A`; });
    
    // Removed the redundant '₹' since formatPrice already includes it, but URL encoding is crucial.
    message += `%0ASubtotal: ${formatPrice(cartTotal())}%0A%0APlease confirm payment & delivery details.`;
    
    // The original wa.me link construction was correct for redirection
    window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');

    // optionally clear cart after redirect
    cart = []; saveCart();
    checkoutModal.classList.add('hidden');
    document.body.classList.remove('hide-scroll');
});

/* ---------- Contact Form (Web3Forms Integration) ---------- */
if (leadForm) {
    // Inject the Web3Forms access key if you're not using a hidden input field
    // leadForm.insertAdjacentHTML('beforeend', `<input type="hidden" name="access_key" value="${WEB3FORMS_ACCESS_KEY}">`);

    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Prepare UI for submission
        if (leadSubmitButton) {
            leadSubmitButton.disabled = true;
            leadSubmitButton.textContent = 'Sending...';
        }
        leadResult.classList.remove('hidden', 'text-green-600', 'text-red-500');
        leadResult.textContent = 'Sending your message...';

        const data = new FormData(e.target);
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                // Success
                const name = document.getElementById('lead-name').value.trim();
                leadResult.classList.add('text-green-600');
                leadResult.textContent = `Thanks, ${name || 'there'}! We've received your message.`;
                e.target.reset();
            } else {
                // Failure
                leadResult.classList.add('text-red-500');
                leadResult.textContent = result.message || 'Something went wrong. Please try again.';
            }

        } catch (error) {
            // Network error
            leadResult.classList.add('text-red-500');
            leadResult.textContent = 'Network error. Please check your connection.';
            console.error('Web3Forms submission error:', error);
        } finally {
            // Reset button state and hide message after delay
            if (leadSubmitButton) {
                leadSubmitButton.disabled = false;
                leadSubmitButton.textContent = 'Send Message';
            }
            setTimeout(() => leadResult.classList.add('hidden'), 5000);
        }
    });
}


/* ---------- Global Listeners and Initializers ---------- */

// sync across tabs
window.addEventListener('storage', ()=>{ cart = JSON.parse(localStorage.getItem('milana_cart') || '[]'); renderCart(); });

// initial render
renderCart();

// footer year
document.getElementById('yr').textContent = new Date().getFullYear();

// mobile menu toggle
document.getElementById('mobile-menu-button').addEventListener('click', ()=>{
    const nav = document.getElementById('mobile-nav'); nav.classList.toggle('hidden');
});

// keyboard accessibility: close cart/modal on Escape
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ closeCartFn(); checkoutModal.classList.add('hidden'); document.body.classList.remove('hide-scroll'); } });