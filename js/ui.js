/*INDEX.HTML*/

window.tailwind = {
    config: {
        theme: {
            extend: {
                colors: {
                    primary: '#22C345',
                    darkGray: '#333333',
                },
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                }
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});