// Function to show the modal and form fields
function showModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.style.display = 'block';
    
    // Show the form fields
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.style.display = 'block';
}

// Function to hide the modal and form fields
function hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.style.display = 'none';
    
    // Hide the form fields
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.style.display = 'none';
}

// Show the modal when the "Add Product" button is clicked
document.getElementById('add-product-button').addEventListener('click', showModal);

// Hide the modal when the close button is clicked
document.querySelector('.close').addEventListener('click', hideModal);

// Hide the modal when the form is submitted
document.getElementById('add-product-form').addEventListener('submit', function (e) {
    e.preventDefault();
    hideModal();
});

// Handle form submission
document.getElementById('add-product-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get input values
    const sku = document.getElementById('sku').value;
    const name = document.getElementById('name').value;
    const thrLink = document.getElementById('thr-link').value;
    const wsLink = document.getElementById('ws-link').value;
    const pricingStrategy = document.getElementById('pricing-strategy').value;
    const basicHandlingTime = document.getElementById('basic-handling-time').value;
    const price = document.getElementById('price').value;
    const medianHT = document.getElementById('median-ht').value;

    // Send the data to your Flask server using Fetch
    fetch('/add_product', {
        method: 'POST',
        body: JSON.stringify({
            sku: sku,
            name: name,
            thrLink: thrLink,
            wsLink: wsLink,
            pricingStrategy: pricingStrategy,
            basicHandlingTime: basicHandlingTime,
            price: price,
            medianHT: medianHT
            // Add other fields as needed
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        if (data.success) {
            // Close the modal and potentially update the product list
            document.getElementById('modal-overlay').style.display = 'none';
            // You can update the product list here if needed
        } else {
            // Handle errors, display a message, etc.
        }
    });
});

// JavaScript code
const menuContainer = document.getElementById('menu-container');
const addProductButton = document.getElementById('add-product-button');

// Show the menu when hovering near the top
window.addEventListener('mousemove', (e) => {
    if (e.clientY < 50) {
        menuContainer.style.display = 'block';
    } else {
        menuContainer.style.display = 'none';
    }
});

// Hide the menu when clicking the "Add Product" button
addProductButton.addEventListener('click', () => {
    menuContainer.style.display = 'none';
});

// Handle the "Delete Selected" button click
document.getElementById('delete-selected-button').addEventListener('click', function () {
    // Get all checkboxes
    const checkboxes = document.querySelectorAll('input[name="selected_product"]');
    const selectedIds = [];

    // Collect IDs of selected items
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIds.push(checkbox.value);
        }
    });

    if (selectedIds.length === 0) {
        alert('No items selected for deletion.');
        return;
    }

    // Ask for confirmation
    const confirmation = confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`);

    if (confirmation) {
        // Send an AJAX request to delete selected items
        fetch('/delete_selected', {
            method: 'POST',
            body: JSON.stringify({ selectedIds }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Items were successfully deleted, you can update the table or take other actions here
                alert(`Deleted ${selectedIds.length} items.`);
            } else {
                // Handle the case where the deletion was not successful
                alert('Failed to delete items.');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const customizeButton = document.getElementById('customize-button');
    const customizeDialog = document.getElementById('customize-dialog');
    const customizeCheckboxes = document.getElementById('customize-checkboxes');
    const customizeSaveButton = document.getElementById('customize-save');
    const customizeCancelButton = document.getElementById('customize-cancel');
    const customizeCloseButton = document.getElementById('customize-close');
    const tableHeaders = document.querySelectorAll('th[data-column]'); // Get table headers with data attributes

    // Function to show the dialog
    function showCustomizeDialog() {
        customizeDialog.style.display = 'block';
    }

    // Function to hide the dialog
    function hideCustomizeDialog() {
        customizeDialog.style.display = 'none';
    }

    // Function to handle the "Customize" button click
    customizeButton.addEventListener('click', showCustomizeDialog);

    // Function to handle the "Close" button click
    customizeCloseButton.addEventListener('click', hideCustomizeDialog);

    // Function to create checkboxes for column customization
    tableHeaders.forEach(header => {
        const column = header.getAttribute('data-column');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = column;
        checkbox.checked = true; // Default: Show all columns

        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(column));

        const checkboxContainer = document.createElement('div');
        checkboxContainer.appendChild(label);

        customizeCheckboxes.appendChild(checkboxContainer);
    });

    // Function to save customizations and apply them
    customizeSaveButton.addEventListener('click', function () {
        const selectedColumns = Array.from(customizeCheckboxes.querySelectorAll('input:checked')).map(checkbox => checkbox.value);

        // Show/hide table headers and data cells based on selected columns
        tableHeaders.forEach(header => {
            const column = header.getAttribute('data-column');
            if (selectedColumns.includes(column)) {
                header.style.display = 'table-cell'; // Show selected headers
            } else {
                header.style.display = 'none'; // Hide unselected headers
            }
        });

        // Show/hide table data cells based on selected columns
        const tableRows = document.querySelectorAll('tr');
        tableRows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td[data-column]'));
            cells.forEach(cell => {
                const column = cell.getAttribute('data-column');
                if (selectedColumns.includes(column)) {
                    cell.style.display = 'table-cell'; // Show selected data cells
                } else {
                    cell.style.display = 'none'; // Hide unselected data cells
                }
            });
        });

        hideCustomizeDialog(); // Hide the dialog after saving customizations
    });

    // Function to cancel and close the dialog
    customizeCancelButton.addEventListener('click', hideCustomizeDialog);
});

