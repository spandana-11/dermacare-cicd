package com.pharmacyManagement.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.AreaDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.Area;
import com.pharmacyManagement.entity.City;
import com.pharmacyManagement.repository.AreaRepository;
import com.pharmacyManagement.repository.CityRepository;
import com.pharmacyManagement.service.AreaService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements AreaService {

	private final AreaRepository areaRepository;
	private final CityRepository cityRepository;

	@Override
	public Response addArea(AreaDTO dto) {
		try {
			Optional<City> city = cityRepository.findById(dto.getCityId());

			if (city.isEmpty()) {
				return new Response(false, null, "City not found for given cityId: " + dto.getCityId(), 404);
			}

			Area area = new Area();
			area.setAreaNames(dto.getAreaNames());
			area.setCityId(dto.getCityId());
			area.setCityName(city.get().getCityName());

			Area saved = areaRepository.save(area);

			AreaDTO responseDTO = new AreaDTO(saved.getId(), saved.getAreaNames(), saved.getCityId(),
					saved.getCityName());

			return new Response(true, responseDTO, "Areas added successfully", 200);

		} catch (Exception e) {
			return new Response(false, null, "Failed to add areas: " + e.getMessage(), 500);
		}
	}

	@Override
	public Response updateArea(String id, AreaDTO dto) {
		try {
			Optional<Area> existing = areaRepository.findById(id);

			if (existing.isEmpty()) {
				return new Response(false, null, "Area not found", 404);
			}

			Optional<City> city = cityRepository.findById(dto.getCityId());
			if (city.isEmpty()) {
				return new Response(false, null, "City not found", 404);
			}

			Area area = existing.get();
			area.setAreaNames(dto.getAreaNames());
			area.setCityId(dto.getCityId());
			area.setCityName(city.get().getCityName());

			Area updated = areaRepository.save(area);

			AreaDTO responseDTO = new AreaDTO(updated.getId(), updated.getAreaNames(), updated.getCityId(),
					updated.getCityName());

			return new Response(true, responseDTO, "Area updated successfully", 200);

		} catch (Exception e) {
			return new Response(false, null, "Failed to update area: " + e.getMessage(), 500);
		}
	}

	@Override
	public Response getAreaById(String id) {
		try {
			Optional<Area> area = areaRepository.findById(id);

			if (area.isEmpty()) {
				return new Response(false, null, "Area not found", 404);
			}

			Area a = area.get();

			AreaDTO dto = new AreaDTO(a.getId(), a.getAreaNames(), a.getCityId(), a.getCityName());

			return new Response(true, dto, "Area found", 200);

		} catch (Exception e) {
			return new Response(false, null, "Failed to fetch area: " + e.getMessage(), 500);
		}
	}

	@Override
	public Response getAllAreas() {
		try {
			List<AreaDTO> list = areaRepository.findAll().stream()
					.map(a -> new AreaDTO(a.getId(), a.getAreaNames(), a.getCityId(), a.getCityName()))
					.collect(Collectors.toList());

			return new Response(true, list, "All areas fetched", 200);

		} catch (Exception e) {
			return new Response(false, null, "Failed to fetch areas: " + e.getMessage(), 500);
		}
	}

	@Override
	public Response deleteArea(String id) {
		try {
			if (!areaRepository.existsById(id)) {
				return new Response(false, null, "Area not found", 404);
			}

			areaRepository.deleteById(id);
			return new Response(true, null, "Area deleted successfully", 200);

		} catch (Exception e) {
			return new Response(false, null, "Failed to delete area: " + e.getMessage(), 500);
		}
	}

	@Override
	public Response getAreasByCityId(String cityId) {
		try {
			if (cityId == null || cityId.trim().isEmpty()) {
				return new Response(false, null, "cityId cannot be null or empty", 400);
			}

			Optional<City> city = cityRepository.findById(cityId);
			if (city.isEmpty()) {
				return new Response(false, null, "City not found for cityId: " + cityId, 404);
			}

			// Fetch areas
			List<Area> areas = areaRepository.findByCityId(cityId);

			if (areas.isEmpty()) {
				return new Response(false, null, "No areas found for cityId: " + cityId, 404);
			}

			// Convert to DTO list
			List<AreaDTO> list = areas.stream()
					.map(a -> new AreaDTO(a.getId(), a.getAreaNames(), a.getCityId(), a.getCityName()))
					.collect(Collectors.toList());

			return new Response(true, list, "Areas fetched for cityId: " + cityId, 200);

		} catch (Exception e) {
			return new Response(false, null, "Failed to fetch areas: " + e.getMessage(), 500);
		}
	}
}
