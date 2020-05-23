let row, primary;
let id = "";
let isCheckedCategory = false;

$(document).ready(function () {
    setPageFields();
    getCategoryTree();
    setLocaleFields();
    getLanguage();
});

$(document).ready(function () {
    $('#input-categories').on('click', '.custom-control-input', function() {
        let $category = $(this).closest('.category');
        if ($(this).is(':checked')) {
            $category.find('.custom-control-input').prop('checked', true);
        } else {
            $category.find('.custom-control-input').prop('checked', false);
        }
    });
    $('#input-categories').on('click', 'label', function() {
        if ($(this).is('.collapsed')) {
            $(this).children('i').removeClass('fa fa-plus-square-o').addClass('far fa-minus-square');
        } else {
            $(this).children('i').removeClass('far fa-minus-square').addClass('fa fa-plus-square-o');
        }
    });
    $('#input-categories').on('change', '.custom-control-input', function() {
        const getCheckedSiblings = (nearCategory) => {
            let isCheckedSibling = false;
            nearCategory.siblings().each((i, elem) => {
                if ($(elem).children().children("input").prop("checked")){
                    isCheckedSibling = true;
                    return;
                }
            })
            return isCheckedSibling;
        }
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
        isCheckedCategory = $checkboxes.find('.custom-control-input').filter( ':checked' ).length > 0;
    });
});

function getCategoryTree() {
    fetch('/categories/gettree', {
    })    .then(function (response) {
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
        })
}

function getUnflatten(arr, parentid) {
    let output = [];
    for(const category of arr) {
        if(category.parentId == parentid) {
            let children = getUnflatten(arr, category.id);

            if(children.length) {
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
                <div class="custom-control custom-checkbox form-check-inline" id="heading-${i}">
                    <input class="custom-control-input" type="checkbox" id="check-${i}" value="${category[i].categoryName}">
                    <label class="custom-control-label" for="check-${i}"></label>
                    <label class="collapsed" data-toggle="collapse" data-target="#collapse-${i}" aria-expanded="false" aria-controls="collapse-${i}">
                       ${category[i].categoryName}(${await getCountBooksByCat(category[i].path)})
                       <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                    </label>
                </div>
                <div class="ml-3">
                    <div id="collapse-${i}" class="collapse" aria-labelledby="heading-${i}" data-parent="#accordionExample">
                    ${await setChilds(category[i].childrens, i)}
                    </div>
                </div>
            </div>`;
        $('#input-categories').append(row);
    }
}

async function setChilds(category, count) {
    id += (count + "-");
    let row = '';
    for (let i in category) {
        if (category[i].childrens === undefined) {
            id += (count + "-");
            row +=
                `<div class="category">
                    <div class="custom-control custom-checkbox form-check-inline" id="heading-${id}${i}">
                        <input class="custom-control-input" type="checkbox" id="check-${id}${i}" value="${category[i].categoryName}">
                        <label class="custom-control-label" for="check-${id}${i}">
                            ${category[i].categoryName}(${await getCountBooksByCat(category[i].path)})
                        </label>
                    </div>
                </div>`;
        } else {
            row +=
                `<div class="category">
                    <div class="custom-control custom-checkbox form-check-inline" id="heading-${id}${i}">
                        <input class="custom-control-input" type="checkbox" id="check-${id}${i}" value="${category[i].categoryName}">
                        <label class="custom-control-label" for="check-${id}${i}"></label>
                        <label class="collapsed" data-toggle="collapse" data-target="#collapse-${id}${i}" aria-expanded="false" aria-controls="collapse-${id}${i}">
                           ${category[i].categoryName}(${await getCountBooksByCat(category[i].path)})
                           <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                        </label>
                    </div>
                    <div class="ml-3">
                        <div id="collapse-${id}${i}" class="collapse" aria-labelledby="heading-${id}${i}" data-parent="#accordionExample">
                            ${await setChilds(category[i].childrens, i)}
                        </div>
                    </div>
                </div>`;
        }
    }
    id = "";
    return row;
}

function advancedSearch() {
    let request = $('#search-input').val().toLowerCase();
    let priceFrom = $('#input-price-from').val() * 100;
    let priceTo = $('#input-price-to').val() * 100;
    let yearOfEditionFrom = $('#input-year-of-edition-from').val();
    let yearOfEditionTo = $('#input-year-of-edition-to').val();
    let pagesFrom = $('#input-pages-from').val();
    let pagesTo = $('#input-pages-to').val();
    let searchBy = $('#search-by input:checked').val();
    let categories;
    if (!isCheckedCategory) {
        categories = $("#input-categories input").map(function() {
            return $(this).val();
        }).get();
    } else {
        categories = $("#input-categories input:checked").map(function() {
            return $(this).val();
        }).get();
    }
    let categoryRequest = "";
    for (let i in categories) {
        categoryRequest += "&categories="+categories[i];
    }
    fetch("/searchAdvanced?request=" + request + "&searchBy=" + searchBy + categoryRequest +
        "&priceFrom=" + priceFrom + "&priceTo=" + priceTo + "&yearOfEditionFrom=" + yearOfEditionFrom + "&yearOfEditionTo=" + yearOfEditionTo +
        "&pagesFrom=" + pagesFrom + "&pagesTo=" + pagesTo, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(data => data.json())
        .then(function (data) {
            addFindeBooks(data)
        });
}

function setPageFields() {
    if (window.location.search === "") {
        fetch("/api/booksSearchPage", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(data => data.json())
            .then(function (data) {
                addFindeBooks(data)
            });
    } else {
        fetch("/searchResult" + window.location.search, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(data => data.json())
            .then(function (data) {
                addFindeBooks(data)
            });
    }
}

function addFindeBooks(data) {
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
        tr.push(`<tr>
                                <td class="align-middle"><img src="images/book${data[i].id}/${data[i].coverImage}" style="max-width: 60px"></td>
                                <td class="align-middle">${convertOriginalLanguageRows(data[i].author, data[i].authorTranslit)}</td>
                                <td class="align-middle">${convertOriginalLanguageRows(data[i].name, data[i].nameTranslit)}</td>
                                <td class="align-middle">${data[i].pages}</td>
                                <td class="align-middle">${data[i].yearOfEdition}</td>
                                <td class="align-middle">${data[i].price / 100}</td>
                                <td class="align-middle">${data[i].category.categoryName}</td>
                                <td class="align-middle">
                                    <form id="bookButton" method="get" action="/page/${data[i].id}">
                                        <button class="btn btn-primary page-of-book-localize" id="buttonBookPage${i}" name="bookPage">
                                            A page of book
                                        </button>
                                    </form>
                                </td>
                            </tr>`
        );
    }
    $('table').append($(tr.join('')));
}

async function getCountBooksByCat(category) {
    return "" + await fetch("/categories/getcount?path=" + category).then(json);
}