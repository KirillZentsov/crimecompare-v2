"""Tests for make_circle_polygon geometry."""
import math
import pytest
from app.services.crime_api import make_circle_polygon


class TestMakeCirclePolygon:
    def test_returns_correct_point_count(self):
        pts = make_circle_polygon(51.5, -0.1, 800)
        assert len(pts) == 32

    def test_custom_point_count(self):
        pts = make_circle_polygon(51.5, -0.1, 800, num_points=16)
        assert len(pts) == 16

    def test_each_point_is_lat_lng_pair(self):
        pts = make_circle_polygon(51.5, -0.1, 800)
        for pt in pts:
            assert len(pt) == 2
            lat, lng = pt
            assert -90 <= lat <= 90
            assert -180 <= lng <= 180

    def test_radius_affects_spread(self):
        small = make_circle_polygon(51.5, -0.1, 100)
        large = make_circle_polygon(51.5, -0.1, 5000)

        def spread(pts):
            lats = [p[0] for p in pts]
            return max(lats) - min(lats)

        assert spread(large) > spread(small)

    def test_center_is_approximately_centroid(self):
        lat, lng = 52.0, -1.5
        pts = make_circle_polygon(lat, lng, 800)
        mean_lat = sum(p[0] for p in pts) / len(pts)
        mean_lng = sum(p[1] for p in pts) / len(pts)
        assert abs(mean_lat - lat) < 0.01
        assert abs(mean_lng - lng) < 0.01

    def test_points_equidistant_from_center(self):
        lat, lng, radius_m = 51.5, -0.1, 800
        pts = make_circle_polygon(lat, lng, radius_m)
        R = 6371000

        distances = []
        for p_lat, p_lng in pts:
            dlat = math.radians(p_lat - lat)
            dlng = math.radians(p_lng - lng)
            a = (math.sin(dlat / 2) ** 2
                 + math.cos(math.radians(lat)) * math.cos(math.radians(p_lat))
                 * math.sin(dlng / 2) ** 2)
            distances.append(R * 2 * math.asin(math.sqrt(a)))

        assert max(distances) - min(distances) < 5  # within 5 metres

    def test_zero_radius_returns_single_cluster(self):
        pts = make_circle_polygon(51.5, -0.1, 0)
        lats = [p[0] for p in pts]
        assert max(lats) - min(lats) < 0.0001
