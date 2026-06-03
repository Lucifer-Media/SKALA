package ru.skala.ras.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LicenseInfo {
    private String series;
    private String issued;
    private int maxUsers;
    private int fullName;
    private String licenseType;
    private String shortPresentation;
    private String fullPresentation;
}
