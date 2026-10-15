package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.CTNL;
import com.example.demo.entity.CTNLId;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;

public interface CTNLRepository extends JpaRepository<CTNL, CTNLId> {

    @EntityGraph(attributePaths = "nguyenLieu")
    List<CTNL> findBySanPham_IdIn(Collection<Integer> sanPhamIds);

    @Modifying
    @Query(value = "DELETE FROM ctnl WHERE sp_id = :productId", nativeQuery = true)
    int deleteByProductId(@Param("productId") Integer productId);

    @EntityGraph(attributePaths = "nguyenLieu")
    List<CTNL> findBySanPham_Id(Integer sanPhamId);

    @Modifying
    @Query(value = "DELETE FROM ctnl WHERE nl_id = :ingredientId", nativeQuery = true)
    int deleteByIngredientId(@Param("ingredientId") Integer ingredientId);
}
