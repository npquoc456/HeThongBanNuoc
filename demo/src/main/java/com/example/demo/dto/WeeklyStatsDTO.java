package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;


public class WeeklyStatsDTO {

    private List<String> labels;

    private List<Integer> quantities;

    private List<BigDecimal> revenues;

    private List<TopProductDTO> topProducts;

    private String topProductCategory;

    private BigDecimal topProductCategoryShare;


    public WeeklyStatsDTO() {
    }


    public List<String> getLabels() {

        return labels;
    }


    public void setLabels(
        List<String> labels
    ) {

        this.labels =
            labels;
    }


    public List<Integer> getQuantities() {

        return quantities;
    }


    public void setQuantities(
        List<Integer> quantities
    ) {

        this.quantities =
            quantities;
    }


    public List<BigDecimal> getRevenues() {

        return revenues;
    }


    public void setRevenues(
        List<BigDecimal> revenues
    ) {

        this.revenues =
            revenues;
    }


    public List<TopProductDTO> getTopProducts() {

        return topProducts;
    }


    public void setTopProducts(
        List<TopProductDTO> topProducts
    ) {

        this.topProducts =
            topProducts;
    }

    public String getTopProductCategory() {
        return topProductCategory;
    }

    public void setTopProductCategory(String topProductCategory) {
        this.topProductCategory = topProductCategory;
    }

    public BigDecimal getTopProductCategoryShare() {
        return topProductCategoryShare;
    }

    public void setTopProductCategoryShare(BigDecimal topProductCategoryShare) {
        this.topProductCategoryShare = topProductCategoryShare;
    }
}