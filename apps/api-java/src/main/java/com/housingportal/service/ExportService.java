package com.housingportal.service;

import com.housingportal.model.request.HousingFeatures;
import com.housingportal.model.response.FastApiDtos;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportService {

    private final FastApiClient fastApiClient;
    private final AnalysisService analysisService;

    private static final String[] CSV_HEADERS = {
            "square_footage", "bedrooms", "bathrooms", "year_built",
            "lot_size", "distance_to_city_center", "school_rating",
            "predicted_price", "predicted_price_formatted"
    };

    /**
     * Generates a CSV export of representative market data
     * with ML predictions from FastAPI.
     */
    public byte[] exportCsv() {
        log.debug("Generating CSV export");
        List<HousingFeatures> sample = buildExportSample();
        FastApiDtos.BatchPredictResponse batch = fastApiClient.predictBatch(sample);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVPrinter printer = new CSVPrinter(writer,
                     CSVFormat.DEFAULT.builder()
                             .setHeader(CSV_HEADERS)
                             .build())) {

            for (int i = 0; i < sample.size(); i++) {
                HousingFeatures f = sample.get(i);
                FastApiDtos.PredictionResult p = batch.getPredictions().get(i);
                printer.printRecord(
                        f.getSquareFootage(),
                        f.getBedrooms(),
                        f.getBathrooms(),
                        f.getYearBuilt(),
                        f.getLotSize(),
                        f.getDistanceToCityCenter(),
                        f.getSchoolRating(),
                        p.getPredictedPrice(),
                        p.getPredictedPriceFormatted()
                );
            }
            printer.flush();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("CSV export failed", e);
            throw new RuntimeException("CSV generation failed: " + e.getMessage(), e);
        }
    }

    // 25-row export sample spanning realistic property profiles
    private List<HousingFeatures> buildExportSample() {
        return List.of(
                feat(850,  1, 1.0, 1978, 3200,  1.2, 5.5),
                feat(1050, 2, 1.5, 1985, 4000,  2.5, 6.0),
                feat(1200, 2, 2.0, 1990, 4500,  3.1, 6.8),
                feat(1350, 3, 2.0, 1993, 5000,  4.2, 7.2),
                feat(1500, 3, 2.0, 1996, 5500,  3.8, 7.5),
                feat(1600, 3, 2.5, 1998, 6000,  2.9, 7.8),
                feat(1750, 3, 2.0, 2000, 6200,  5.5, 8.0),
                feat(1850, 3, 2.0, 2003, 6500,  4.5, 8.2),
                feat(1950, 4, 2.5, 2005, 7000,  3.3, 8.3),
                feat(2100, 4, 2.5, 2007, 7200,  6.1, 7.9),
                feat(2200, 4, 3.0, 2009, 7500,  2.1, 8.5),
                feat(2350, 4, 3.0, 2010, 8000,  4.7, 8.7),
                feat(2500, 4, 3.5, 2012, 8500,  3.5, 8.9),
                feat(2700, 5, 3.0, 2013, 9000,  5.2, 8.4),
                feat(2900, 5, 3.5, 2015, 9500,  2.8, 9.0),
                feat(3100, 5, 4.0, 2016, 10000, 7.5, 8.1),
                feat(3300, 5, 4.0, 2017, 10500, 3.9, 9.1),
                feat(3500, 5, 4.5, 2018, 11000, 1.8, 9.3),
                feat(3700, 6, 4.0, 2019, 11500, 6.3, 8.6),
                feat(3900, 6, 4.5, 2020, 12000, 4.1, 9.2),
                feat(4200, 6, 5.0, 2021, 13000, 2.5, 9.4),
                feat(4500, 6, 5.0, 2022, 14000, 1.5, 9.6),
                feat(5000, 7, 5.5, 2023, 16000, 0.9, 9.7),
                feat(5500, 7, 6.0, 2023, 18000, 0.5, 9.8),
                feat(6000, 8, 6.0, 2024, 20000, 0.3, 9.9)
        );
    }

    private HousingFeatures feat(int sqft, int beds, double baths,
                                  int year, int lot, double dist, double rating) {
        return HousingFeatures.builder()
                .squareFootage(sqft).bedrooms(beds).bathrooms(baths)
                .yearBuilt(year).lotSize(lot)
                .distanceToCityCenter(dist).schoolRating(rating)
                .build();
    }
}