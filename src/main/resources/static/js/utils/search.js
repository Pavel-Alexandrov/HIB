let row, primary;
let isCheckedCategory = false;
let currentPage = 0;
let amountBooksInPage = 0;
let amountBooksInDb;
let ddmAmountBook = $("#ddmAmountBook");

$(document).ready(async function () {
    getLanguage();
    getCategoryTree();
    setListeners();
    setLocaleFields();
    amountBooksInPage = ddmAmountBook.text();
    getPageWithBooks(ddmAmountBook.text(), currentPage++);
    $(document).ready(function () {
        setTimeout(() => {
            $(".preloader").show("slow");
        }, 300)
        setTimeout(() => {
            $(".preloader").hide("slow");
        }, 1700)
    });
});

function getQuantityPage() {
    if (amountBooksInDb < amountBooksInPage) {
        return 1;
    }
    return Math.ceil(amountBooksInDb / amountBooksInPage);
}

async function addPagination() {
    let numberOfPagesInPagination = 7;
    let quantityPage = getQuantityPage();
    let startIter;
    let endIter = currentPage;
    let pag;
    let halfPages = Math.floor(numberOfPagesInPagination / 2);
    if (quantityPage <= numberOfPagesInPagination || quantityPage === 0) {
        startIter = 1;
        endIter = quantityPage;
    } else {
        if (currentPage - halfPages <= 0) {
            startIter = 1;
            endIter = numberOfPagesInPagination;
        } else if (currentPage + halfPages > quantityPage) {
            startIter = quantityPage - numberOfPagesInPagination + 1;
            endIter = quantityPage;
        } else {
            startIter = currentPage - halfPages;
            endIter = currentPage + halfPages;
        }
    }
    pag = `<nav aria-label="Page navigation example">
                    <ul class="pagination">`;
    pag += currentPage === 1 ? `<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">` :
        `<li class="page-item"><a class="page-link" onclick="loadMore(1)" href="#">`;
    pag += `<span aria-hidden="true">&laquo;</span></a></li>`;
    for (let i = startIter; i < endIter + 1; i++) {
        if (currentPage === i) {
            pag += `<li class="page-item active"><a class="page-link" onclick="loadMore(${i})">${i}</a></li>`;
        } else {
            pag += `<li class="page-item"><a class="page-link" onclick="loadMore(${i})">${i}</a></li>`;
        }
    }
    pag += currentPage === quantityPage ? `<li class="page-item disabled">` : `<li class="page-item">`
    pag += `<a class="page-link" onclick="loadMore(${quantityPage})" href="#"><span aria-hidden="true">&raquo;</span></a></li>
                    </ul>
                </nav>`;
    $("#rowForPagination").html(pag);
}

function loadMore(pageNumber) {
    currentPage = pageNumber;
    advancedSearch(amountBooksInPage, pageNumber - 1)
}

// function getPageWithBooks(amount, page) {
//     GET(`/api/book?limit=${amount}&start=${page}`)
//         .then(json)
//         .then((data) => {
//             amountBooksInDb = data.amountOfBooksInDb;
//             addBooksToPage(data.books);
//         })
// }

function setAmountBooksInPage(amount) {
    currentPage = 0;
    amountBooksInPage = amount;
    ddmAmountBook.text(amount);
    advancedSearch(amount, 0);
}

function setListeners () {
    $('.search-submit').on('click', () => {
        currentPage = 0;
        advancedSearch(ddmAmountBook.text(), currentPage++)
    });

    $('#input-categories').on('click', '.custom-control-input', function () {
        let $category = $(this).closest('.category');
        if ($(this).is(':checked')) {
            $category.find('.custom-control-input').prop('checked', true);
        } else {
            $category.find('.custom-control-input').prop('checked', false);
        }
    });
    $('#input-categories').on('click', 'label', function () {
        if ($(this).is('.collapsed')) {
            $(this).children('i').removeClass('fa fa-plus-square-o').addClass('far fa-minus-square');
        } else {
            $(this).children('i').removeClass('far fa-minus-square').addClass('fa fa-plus-square-o');
        }
    });
    $('#input-categories').on('change', '.custom-control-input', function () {
        const getCheckedSiblings = (nearCategory) => {
            let isCheckedSibling = false;
            nearCategory.siblings().each((i, elem) => {
                if ($(elem).children().children("input").prop("checked")) {
                    isCheckedSibling = true;
                    return;
                }
            });
            return isCheckedSibling;
        };
        const isChecked = $(this).is(':checked');
        let nearCategory = $(this).parent().parent();
        let isCheckedSiblings = getCheckedSiblings(nearCategory);
        do {
            if (isCheckedSiblings) {
                return;
            }
            nearCategory = nearCategory.parent().parent().parent();
            nearCategory.children().children("input").prop("checked", isChecked);
            isCheckedSiblings = getCheckedSiblings(nearCategory);
        } while (nearCategory.parent().parent().parent().hasClass("category"));
        let $checkboxes = $('#input-categories');
        isCheckedCategory = $checkboxes.find('.custom-control-input').filter(':checked').length > 0;
    });

    $(document).keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13'&& $("#search-input").val().trim() !== '') {
            $('#search-submit').click();
        }
    });
}

async function getCategoryTree() {
    fetch('/categories/gettree', {}).then(function (response) {
        return response.json()
    })
        .then(function (json) {
            categoryArr = [];
            for (let i in json) {
                categoryId = json[i][0];
                categoryName = json[i][1];
                categoryPath = json[i][2];
                categoryParent = json[i][3];
                const category = {
                    id: categoryId,
                    categoryName: categoryName,
                    path: categoryPath,
                    parentId: categoryParent
                };
                categoryArr.push(category);
            }
            let tree = getUnflatten(categoryArr, null);
            setTreeView(tree);
        });
}

function getUnflatten(arr, parentid) {
    let output = [];
    for (const category of arr) {
        if (category.parentId == parentid) {
            let children = getUnflatten(arr, category.id);
            if (children.length) {
                category.childrens = children
            }
            output.push(category)
        }
    }
    return output
}

async function setTreeView(category) {
    for (let i in category) {
        row =
            `<div class="category">
                <div class="custom-control custom-checkbox form-check-inline" id="heading-${category[i].id}">
                    <input class="custom-control-input" type="checkbox" id="check-${category[i].id}" value="${category[i].categoryName}">
                    <label class="custom-control-label" for="check-${category[i].id}"></label>
                    <label class="collapsed" data-toggle="collapse" data-target="#collapse-${category[i].id}" aria-expanded="false" aria-controls="collapse-${category[i].id}">
                       ${category[i].categoryName}(${await getCountBooksByCat(category[i].path)})
                       <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                    </label>
                </div>
                <div class="ml-3">
                    <div id="collapse-${category[i].id}" class="collapse" aria-labelledby="heading-${category[i].id}" data-parent="#accordionExample">
                    ${await setChilds(category[i].childrens)}
                    </div>
                </div>
            </div>`;
        $('#input-categories').append(row);
    }
}

async function setChilds(category) {
    let row = '';
    for (let i in category) {
        if (category[i].childrens === undefined) {
            row +=
                `<div class="category">
                    <div class="custom-control custom-checkbox form-check-inline" id="heading-${category[i].id}">
                        <input class="custom-control-input" type="checkbox" id="check-${category[i].id}" value="${category[i].categoryName}">
                        <label class="custom-control-label" for="check-${category[i].id}">
                            ${category[i].categoryName}(${await getCountBooksByCat(category[i].path)})
                        </label>
                    </div>
                </div>`;
        } else {
            row +=
                `<div class="category">
                    <div class="custom-control custom-checkbox form-check-inline" id="heading-${category[i].id}">
                        <input class="custom-control-input" type="checkbox" id="check-${category[i].id}" value="${category[i].categoryName}">
                        <label class="custom-control-label" for="check-${category[i].id}"></label>
                        <label class="collapsed" data-toggle="collapse" data-target="#collapse-${category[i].id}" aria-expanded="false" aria-controls="collapse-${category[i].id}">
                           ${category[i].categoryName}(${await getCountBooksByCat(category[i].path)})
                           <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                        </label>
                    </div>
                    <div class="ml-3">
                        <div id="collapse-${category[i].id}" class="collapse" aria-labelledby="heading-${category[i].id}" data-parent="#accordionExample">
                            ${await setChilds(category[i].childrens)}
                        </div>
                    </div>
                </div>`;
        }
    }
    return row;
}

async function advancedSearch(amount, page) {
    let request = $('#search-input').val();
    let priceFrom = $('#input-price-from').val() * 100;
    let priceTo = $('#input-price-to').val() * 100;
    let yearOfEditionFrom = $('#input-year-of-edition-from').val();
    let yearOfEditionTo = $('#input-year-of-edition-to').val();
    let pagesFrom = $('#input-pages-from').val();
    let pagesTo = $('#input-pages-to').val();
    let searchBy = $('#search-by input:checked').val();
    let categories;
    if (!isCheckedCategory) {
        categories = $("#input-categories input").map(function () {
            return $(this).val();
        }).get();
    } else {
        categories = $("#input-categories input:checked").map(function () {
            return $(this).val();
        }).get();
    }
    let categoryRequest = "";
    for (let i in categories) {
        categoryRequest += "&categories=" + categories[i];
    }
    fetch("/searchAdvanced?request=" + request + "&searchBy=" + searchBy + categoryRequest +
        "&priceFrom=" + priceFrom + "&priceTo=" + priceTo + "&yearOfEditionFrom=" + yearOfEditionFrom + "&yearOfEditionTo=" + yearOfEditionTo +
        "&pagesFrom=" + pagesFrom + "&pagesTo=" + pagesTo + "&page=" + page + "&size=" + amount, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(data => data.json())
        .then(function (data) {
            setLocaleFields();
            amountBooksInDb = data.amountOfBooksInDb;
            addFindeBooks(data.books)
        });
}

function getPageWithBooks(amount, page) {
    setTimeout(function(){
        if (window.location.pathname.split("/").pop() === "search") {
            let request = decodeURIComponent(window.location.search).split("=").pop();
            $('#search-input').val(request);
            let url = window.location.pathname;
            history.pushState(null, null, url);
            advancedSearch(amount, page);
        } else {
            let checkId = '#check-' + window.location.pathname.split("/").pop();
            $(checkId).click();
            advancedSearch(amount, page);
            let tmp = [];
            tmp = window.location.pathname.split("/");
            tmp.length = tmp.length - 1;
            let url = tmp.join("/");
            history.pushState(null, null, url);
        }
    },2000);

}

async function addFindeBooks(data) {
    $('table').empty();
    let table = [];
    table.push(`<thead>
                        <tr>
                            <th></th>
                            <th id="author_search_page">Author</th>
                            <th id="name_search_page">Name</th>
                            <th id="pages_search_page">Pages</th>
                            <th id="edition_search_page">Year of edition</th>
                            <th id="price_search_page">Price, €</th>
                            <th id="category_search_page">Category</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>`);
    $('table').append($(table.join('')));
    let tr = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].yearOfEdition == null) {
            data[i].yearOfEdition = "-";
        } if(data[i].category.categoryName == null) {
            data[i].category.categoryName = "-";
        } if(data[i].pages == null) {
            data[i].pages = "-";
        } if(data[i].price == null) {
            data[i].price = "-";
        }
        tr.push(`<tr>
                                <td class="align-middle"><img src="../images/book${data[i].id}/${data[i].coverImage}" style="max-width: 60px"></td>
                                <td class="align-middle">${convertOriginalLanguageRows(data[i].author, data[i].authorTranslit)}</td>
                                <td class="align-middle">${convertOriginalLanguageRows(data[i].name, data[i].nameTranslit)}</td>
                                <td class="align-middle">${data[i].pages}</td>
                                <td class="align-middle">${data[i].yearOfEdition}</td>
                                <td class="align-middle">${data[i].price / 100}</td>
                                <td class="align-middle">${data[i].category.categoryName}</td>
                                <td class="align-middle">
                                    <form id="bookButton${i}" method="get" action="/page/${data[i].id}">
                                        <button class="btn btn-primary page-of-book-localize" id="buttonBookPage${i}" name="bookPage">
                                            A page of book
                                        </button>
                                    </form>
                                </td>
                            </tr>`
        );
    }
    $('table').append($(tr.join('')));
    addPagination();
}

async function getCountBooksByCat(category) {
    return "" + await fetch("/categories/getcount?path=" + category).then(json);
}
