package com.pegasus.backend.features.catalog.service;

import com.pegasus.backend.exception.ResourceNotFoundException;
import com.pegasus.backend.features.catalog.dto.CreateImageRequest;
import com.pegasus.backend.features.catalog.dto.ImageResponse;
import com.pegasus.backend.features.catalog.dto.UpdateImageRequest;
import com.pegasus.backend.features.catalog.entity.Image;
import com.pegasus.backend.features.catalog.mapper.ImageMapper;
import com.pegasus.backend.features.catalog.repository.ImageRepository;
import com.pegasus.backend.features.catalog.repository.ProductRepository;
import com.pegasus.backend.features.catalog.repository.VariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service para gestión de imágenes
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ImageService {

    private final ImageRepository imageRepository;
    private final ProductRepository productRepository;
    private final VariantRepository variantRepository;
    private final ImageMapper imageMapper;

    /**
     * Obtener todas las imágenes de un producto
     */
    public List<ImageResponse> getImagesByProductId(Long productId) {
        log.debug("Getting images for product: {}", productId);
        List<Image> images = imageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        return imageMapper.toResponseList(images);
    }

    /**
     * Obtener todas las imágenes de una variante
     */
    public List<ImageResponse> getImagesByVariantId(Long variantId) {
        log.debug("Getting images for variant: {}", variantId);
        List<Image> images = imageRepository.findByVariantIdOrderByDisplayOrderAsc(variantId);
        return imageMapper.toResponseList(images);
    }

    /**
     * Obtener imagen por ID
     */
    public ImageResponse getImageById(Long id) {
        log.debug("Getting image by id: {}", id);
        Image image = findImageById(id);
        return imageMapper.toResponse(image);
    }

    /**
     * Crear nueva imagen
     */
    @Transactional
    public ImageResponse createImage(CreateImageRequest request) {
        log.info("Creating image for product: {}", request.productId());

        // Validar que el producto existe
        if (!productRepository.existsById(request.productId())) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + request.productId());
        }

        // Validar que la variante existe si se especifica
        if (request.variantId() != null && !variantRepository.existsById(request.variantId())) {
            throw new ResourceNotFoundException("Variante no encontrada con ID: " + request.variantId());
        }

        Image image = imageMapper.toEntity(request);
        
        // Si no se especifica isPrimary, establecer a false
        if (image.getIsPrimary() == null) {
            image.setIsPrimary(false);
        }
        
        // Si no se especifica displayOrder, establecer a 0
        if (image.getDisplayOrder() == null) {
            image.setDisplayOrder(0);
        }

        // Si se marca como primary, desmarcar otras imágenes primary del mismo producto/variante
        if (image.getIsPrimary()) {
            if (image.getVariantId() != null) {
                imageRepository.findByVariantIdAndIsPrimaryTrue(image.getVariantId())
                        .ifPresent(primaryImage -> {
                            primaryImage.setIsPrimary(false);
                            imageRepository.save(primaryImage);
                        });
            } else {
                imageRepository.findByProductIdAndIsPrimaryTrue(image.getProductId())
                        .ifPresent(primaryImage -> {
                            primaryImage.setIsPrimary(false);
                            imageRepository.save(primaryImage);
                        });
            }
        }

        Image saved = imageRepository.save(image);
        log.info("Image created successfully for product: {}", saved.getProductId());
        return imageMapper.toResponse(saved);
    }

    /**
     * Actualizar imagen existente
     */
    @Transactional
    public ImageResponse updateImage(Long id, UpdateImageRequest request) {
        log.info("Updating image: {}", id);

        Image image = findImageById(id);

        // Si se marca como primary, desmarcar otras imágenes primary del mismo producto/variante
        if (request.isPrimary() != null && request.isPrimary() && !image.getIsPrimary()) {
            if (image.getVariantId() != null) {
                imageRepository.findByVariantIdAndIsPrimaryTrue(image.getVariantId())
                        .ifPresent(primaryImage -> {
                            if (!primaryImage.getId().equals(id)) {
                                primaryImage.setIsPrimary(false);
                                imageRepository.save(primaryImage);
                            }
                        });
            } else {
                imageRepository.findByProductIdAndIsPrimaryTrue(image.getProductId())
                        .ifPresent(primaryImage -> {
                            if (!primaryImage.getId().equals(id)) {
                                primaryImage.setIsPrimary(false);
                                imageRepository.save(primaryImage);
                            }
                        });
            }
        }

        imageMapper.updateEntityFromDto(request, image);
        Image updated = imageRepository.save(image);

        log.info("Image updated successfully: {}", id);
        return imageMapper.toResponse(updated);
    }

    /**
     * Eliminar imagen
     */
    @Transactional
    public void deleteImage(Long id) {
        log.info("Deleting image: {}", id);
        Image image = findImageById(id);
        imageRepository.delete(image);
        log.info("Image deleted successfully: {}", id);
    }

    /**
     * Método auxiliar para buscar imagen por ID
     */
    private Image findImageById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada con ID: " + id));
    }
}
