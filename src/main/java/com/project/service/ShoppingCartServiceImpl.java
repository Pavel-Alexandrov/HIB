package com.project.service;

import com.project.dao.CartItemDAO;
import com.project.dao.ShoppingCartDAO;
import com.project.model.ShoppingCartDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;

@AllArgsConstructor
@Service
@Transactional
public class ShoppingCartServiceImpl implements ShoppingCartService {

    private ShoppingCartDAO cartDAO;

    private CartItemDAO cartItemDAO;


    @Override
    public ShoppingCartDTO getCartById(Long id) {
        return cartDAO.getCartById(id);
    }

    @Override
    public void updateCart(ShoppingCartDTO cart) {
        cartDAO.updateCart(cart);
    }

    @Override
    public void deletCartItem(Long id) {
        cartItemDAO.deleteCartItem(id);
    }

    @Override
    public void mergeCarts(HttpServletRequest request, Long id) {
        ShoppingCartDTO cart = (ShoppingCartDTO) request.getSession().getAttribute("shoppingcart");
        if (cart != null) {
            ShoppingCartDTO mainCart = cartDAO.getCartById(id);
            mainCart.mergeCarts(cart);
            cartDAO.updateCart(mainCart);
            request.getSession().removeAttribute("shoppingcart");
            request.getSession().setAttribute("cartId", id);
        }
    }
}
