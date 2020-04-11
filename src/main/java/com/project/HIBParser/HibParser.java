package com.project.HIBParser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.model.BookDTO;
import com.project.model.Image;
import com.project.model.LocaleString;
import com.project.service.BookService;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
public class HibParser {

    @Autowired
    BookService bookService;

    @Autowired
    private ObjectMapper objectMapper;

    private String avatar = "avatar.jpg";

    private LocaleString initLocaleString(JsonNode node) {
        return new LocaleString(node.get("ru").asText(), node.get("en").asText(),
                node.get("fr").asText(), node.get("it").asText(), node.get("de").asText(),
                node.get("cs").asText(), node.get("gr").asText());
    }

    private void writeImgToFile(String path, byte[] bytes) {
            try {
                FileUtils.writeByteArrayToFile(new File(path), bytes);
            } catch (IOException e) {
                e.printStackTrace();
            }
    }

    public String loadImage(byte[] file){
        long id = Long.parseLong(bookService.getLastIdOfBook()) + 1;
        String avatarPath = "img/book" + id + "/" + avatar;
        writeImgToFile(avatarPath, file);
        return "";
    }

    public BookDTO getBookFromJSON(String json) {
        JsonNode jsonNode = null;
        long id = Long.parseLong(bookService.getLastIdOfBook()) + 1;
        try {
            jsonNode = objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        List<Image> listImage = new ArrayList<>();
        listImage.add(new Image(0, avatar));
        String avatarPath = "img/book" + id + "/" + avatar;
        byte[] decodedBytes = Base64.getDecoder().decode(jsonNode.get("avatar").asText());
        writeImgToFile(avatarPath, decodedBytes);

        JsonNode listBytes = jsonNode.get("additionalPhotos");
        for (int i = 0; i < listBytes.size(); i++) {
            String additionalPhoto = "img/book" + id + "/" + i + ".jpg";
            byte[] tmpDecodedBytes = Base64.getDecoder().decode(listBytes.get(i).asText());
            writeImgToFile(additionalPhoto, tmpDecodedBytes);
            listImage.add(new Image(0, i + ".jpg"));
        }

        return BookDTO.builder()
                .id(id)
                .name(initLocaleString(jsonNode.get("name")))
                .author(initLocaleString(jsonNode.get("author")))
                .desc(initLocaleString(jsonNode.get("desc")))
                .edition(initLocaleString(jsonNode.get("edition")))
                .yearOfEdition(jsonNode.get("yearOfEdition").asText())
                .pages(jsonNode.get("pages").asLong())
                .price(jsonNode.get("price").asLong())
                .originalLanguage(jsonNode.get("originalLanguage").asText())
                .coverImage(avatar)
                .imageList(listImage).build();
    }
}
