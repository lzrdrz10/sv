 window.addEventListener("scroll", () => {
      document.getElementById("header").classList.toggle("scrolled", window.scrollY > 100);
    });

    const DEFAULT_AVATAR = "https://i.ibb.co/4f4Pv2K/user.png";
    const avatar = document.getElementById("avatar");

    function loadUserProfile() {
      try {
        const icono = localStorage.getItem("iconoUsuario");
        avatar.src = icono || DEFAULT_AVATAR;

        avatar.onerror = () => {
          avatar.src = DEFAULT_AVATAR;
        };

      } catch (err) {
        console.error(err);
      }
    }

    loadUserProfile();