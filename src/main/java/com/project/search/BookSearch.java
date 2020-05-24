package com.project.search;

import com.project.model.BookNewDTO;
import com.project.model.OriginalLanguage;
import com.project.service.abstraction.BookService;
import lombok.AllArgsConstructor;
import org.apache.lucene.search.Query;
import org.hibernate.search.SearchFactory;
import org.hibernate.search.jpa.FullTextEntityManager;
import org.hibernate.search.jpa.FullTextQuery;
import org.hibernate.search.jpa.Search;
import org.hibernate.search.query.dsl.QueryBuilder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.List;

@Repository
@Transactional
@AllArgsConstructor
public class BookSearch {

    @PersistenceContext
    private final EntityManager entityManager;

    private final BookService bookService;

    public List<BookNewDTO> search(String req) {
        List<BookNewDTO> result = new ArrayList<>();

        if (req == "") {
            return result;
        }

        List<OriginalLanguage> results = getOriginalLanguageList(req);

        for (OriginalLanguage originalLanguage : results) {
            BookNewDTO bookDTO = bookService.getBookBySearchRequestAdvanced(originalLanguage);
            if (bookDTO != null) {
                result.add(bookDTO);
            }
        }
        return result;
    }

    public List<BookNewDTO> search(String req, Long priceFrom, Long priceTo, String yearOfEditionFrom, String yearOfEditionTo, Long pagesFrom,
                                   Long pagesTo, String searchBy, List<String> categories) {
        if (req == "") {
            return bookService.getBooksBySearchParameters(priceFrom, priceTo, yearOfEditionFrom, yearOfEditionTo,  pagesFrom, pagesTo, categories);
        }

        List<OriginalLanguage> results = getOriginalLanguageList(req, searchBy);
        List<BookNewDTO> result = new ArrayList<>();

        for (OriginalLanguage originalLanguage : results) {
            String name;
            String translitName;
            if (searchBy.equals("author")) {
                name = originalLanguage.getAuthor();
                translitName = originalLanguage.getAuthorTranslit();
            } else {
                name = originalLanguage.getName();
                translitName = originalLanguage.getNameTranslit();
            }
            BookNewDTO bookDTO = bookService.getBookBySearchRequest(name, translitName, originalLanguage, priceFrom, priceTo, yearOfEditionFrom,
                    yearOfEditionTo, pagesFrom, pagesTo, searchBy, categories);
            if (bookDTO != null) {
                result.add(bookDTO);
            }
        }
        return result;
    }

    public List<BookNewDTO> search(String req, boolean isShow) {
        List<OriginalLanguage> results = getOriginalLanguageList(req);
        List<BookNewDTO> result = new ArrayList<>();

        for (OriginalLanguage originalLanguage : results) {
            BookNewDTO bookDTO = bookService.getBookBySearchRequest(originalLanguage, isShow);
            if (bookDTO != null) {
                result.add(bookDTO);
            }
        }
        return result;
    }

    private List<OriginalLanguage> getOriginalLanguageList(String req) {
        FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);

        QueryBuilder queryBuilder = fullTextEntityManager
                .getSearchFactory()
                .buildQueryBuilder()
                .forEntity(OriginalLanguage.class)
                .get();
        Query query = queryBuilder
                .keyword()
                .wildcard()
                //.fuzzy()
                //.withEditDistanceUpTo(1)
                //.withPrefixLength(0)
                .onFields("author", "name", "edition",
                        "authorTranslit", "nameTranslit", "editionTranslit")
                .matching(req + "*")
                .createQuery();

        FullTextQuery jpaQuery = fullTextEntityManager.createFullTextQuery(query, OriginalLanguage.class);
        return jpaQuery.getResultList();
    }

    private List<OriginalLanguage> getOriginalLanguageList(String req, String searchBy) {
        FullTextEntityManager fullTextEntityManager = Search.getFullTextEntityManager(entityManager);
        String []fields;

        switch (searchBy) {
            case "name": fields = new String[]{"name", "nameTranslit"};
            break;

            case "author": fields = new String[]{"author", "authorTranslit"};
            break;

            default: fields = new String[]{"name", "nameTranslit", "author", "authorTranslit"};
            break;
        }

        QueryBuilder queryBuilder = fullTextEntityManager
                .getSearchFactory()
                .buildQueryBuilder()
                .forEntity(OriginalLanguage.class)
                .get();
        Query query = queryBuilder
                .keyword()
                .wildcard()
                //.fuzzy()
                //.withEditDistanceUpTo(1)
                //.withPrefixLength(0)
                .onFields(fields)
                .matching(req + "*")
                .createQuery();

        FullTextQuery jpaQuery = fullTextEntityManager.createFullTextQuery(query, OriginalLanguage.class);
        return jpaQuery.getResultList();
    }
}
