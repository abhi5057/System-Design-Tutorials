package com.ecommerce.order_system.service;

import com.ecommerce.order_system.dao.OrderDao;
import com.ecommerce.order_system.dto.CreateOrderRequest;
import com.ecommerce.order_system.dto.OrderItemDto;
import com.ecommerce.order_system.exception.InvalidOperationException;
import com.ecommerce.order_system.exception.ResourceNotFoundException;
import com.ecommerce.order_system.model.Order;
import com.ecommerce.order_system.model.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderDao orderDao;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order mockOrder;

    @BeforeEach
    void setUp() {
        mockOrder = Order.builder()
                .id(1L)
                .customerEmail("test@example.com")
                .status(OrderStatus.PENDING)
                .build();
    }

    @Test
    void createOrder_ShouldSaveAndReturnOrder() {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerEmail("test@example.com");

        OrderItemDto itemDto = new OrderItemDto();
        itemDto.setProductId("PROD-1");
        itemDto.setQuantity(2);
        itemDto.setPrice(new BigDecimal("10.00"));
        request.setItems(List.of(itemDto));

        when(orderDao.save(any(Order.class))).thenReturn(mockOrder);

        // Act
        Order createdOrder = orderService.createOrder(request);

        // Assert
        assertNotNull(createdOrder);
        assertEquals(OrderStatus.PENDING, createdOrder.getStatus());
        verify(orderDao, times(1)).save(any(Order.class));
    }

    @Test
    void getOrderById_WhenOrderExists_ShouldReturnOrder() {
        // Arrange
        when(orderDao.findById(1L)).thenReturn(Optional.of(mockOrder));

        // Act
        Order foundOrder = orderService.getOrderById(1L);

        // Assert
        assertNotNull(foundOrder);
        assertEquals(1L, foundOrder.getId());
    }

    @Test
    void getOrderById_WhenOrderDoesNotExist_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(orderDao.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(99L));
    }

    @Test
    void cancelOrder_WhenOrderIsPending_ShouldUpdateStatusToCancelled() {
        // Arrange
        when(orderDao.findById(1L)).thenReturn(Optional.of(mockOrder));

        // Act
        orderService.cancelOrder(1L);

        // Assert
        assertEquals(OrderStatus.CANCELLED, mockOrder.getStatus());
        verify(orderDao, times(1)).save(mockOrder);
    }

    @Test
    void cancelOrder_WhenOrderIsNotPending_ShouldThrowInvalidOperationException() {
        // Arrange
        mockOrder.setStatus(OrderStatus.SHIPPED);
        when(orderDao.findById(1L)).thenReturn(Optional.of(mockOrder));

        // Act & Assert
        assertThrows(InvalidOperationException.class, () -> orderService.cancelOrder(1L));
        verify(orderDao, never()).save(any());
    }
}
