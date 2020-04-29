package com.project.dao.abstraction;

import com.project.model.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookDao extends GenericDao<Long, Book> {

    BookDTO getBookDTOFromBook(Book book);

    Book getBookFromBookDTO(BookDTO bookDTO);

    BookDTO getBookByIdLocale(long id);

    List<BookDTO20> get20BookDTO(String locale);

    BookDTO20 getBookBySearchRequest(LocaleString localeString, String locale);

    BookDTO getBookDTOById(long id);

    String getLastIdOfBook();

    PageableBookDTO getPageBookDTOByPageable(Pageable pageable, boolean disabled);

    String getQuantityBook();

    BookNewDTO getNewBookDTObyIdAndLang(Long id, String lang);

    List<BookDTOForCategories> getBooksByCategoryId(Long categoryId, String lang);
}
