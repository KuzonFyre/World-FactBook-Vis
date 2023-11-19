 let main;

document.addEventListener('DOMContentLoaded', function () {
    main = new Main();
    main.init();

    // Attach event listener to close dropdown on window click
    window.addEventListener('click', function (event) {
        main.closeDropdown(event);
    });

    // Attach onclick listeners after DOMContentLoaded
    // Drop down main menu
    var dropdownButton = document.querySelector('.menu button');
    dropdownButton.addEventListener('click', function () {
        main.toggleDropdown();
    });

    // Dropdown menu items
    var dropdownItems = document.querySelectorAll('.menu .dropdown-content a');
    dropdownItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var projectionType = item.getAttribute('data-projection-type');
            main.changeProjection(projectionType);
        });
    });
});
