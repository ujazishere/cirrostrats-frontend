/**
 * Data normalization utilities
 * 
 * This module contains utility functions for normalizing data structures
 * from various API responses.
 */

import flightService from './flightService';

/**
 * Normalizes AJMS data structure to ensure consistent format.
 * 
 * TODO: *** CAUTION DO NOT REMOVE THIS NORMALIZATION STEP ***
 * *** Error prone such that it may return jumbled data from various dates. 
 * This is a temporary fix to normalize ajms data until we can fix the backend to return consistent JMS data.
 * 
 * @param ajms - The raw Amazon JMS data object
 * @returns Normalized JMS data wrapped in a { data } object
 */
export function normalizeAjms(ajms: any): { data: any; error?: any } {
  const result: any = {};

  for (const [key, val] of Object.entries(ajms)) {
    if (val && typeof val === "object" && "value" in val) {
      // case: { timestamp, value }
      result[key] = (val as any).value;
    } else if (typeof val === "string") {
      // case: plain string
      result[key] = val;
    } else {
      // everything else
      result[key] = null;
    }
  }

  return { data: result }; // keep .data wrapper
}

/**
 * Validates airport data by comparing AJMS departure/arrival with FlightAware origin/destination.
 * 
 * This is a temporary fix to catch AJMS data route discrepancies with FlightAware.
 * This does not resolve the root cause of airport discrepancies but at least prevents displaying incorrect data.
 * 
 * TODO VHP: What if there is a discrepancy between flightStats and the resolved JMS/flightAware?
 * 
 * @param ajmsData - AJMS data object with departure and arrival airports
 * @param flightAwareRes - FlightAware response with fa_origin and fa_destination
 * @returns Validated AJMS data, or nullified data if discrepancy is detected
 */
export function validateAirportData(
  ajmsData: { data: { departure: string; arrival: string } },
  flightAwareRes: {
    data: { fa_origin: string; fa_destination: string };
    error: boolean;
  }
): { data: any; error?: string } {
  // If no AJMS data or no FlightAware data, return as-is
  if (!ajmsData?.data || !flightAwareRes?.data || flightAwareRes.error) {
    return ajmsData;
  }
  
  const ajmsDeparture = ajmsData.data.departure;
  const ajmsArrival = ajmsData.data.arrival;
  const faOrigin = flightAwareRes.data.fa_origin;
  const faDestination = flightAwareRes.data.fa_destination;
  
  // Check for discrepancy
  if (
    (ajmsDeparture && faOrigin && ajmsDeparture !== faOrigin) ||
    (ajmsArrival && faDestination && ajmsArrival !== faDestination)
  ) {
    // Log the discrepancy
    flightService.postNotifications(
      `Airport Discrepancy: \n**ajms** ${JSON.stringify(
        ajmsData.data
      )} \n**flightAware** ${JSON.stringify(flightAwareRes.data)}`
    );
    
    // Return nullified AJMS data (mark as faulty)
    return { ...ajmsData, data: null, error: 'Airport discrepancy detected' };
  }
  
  // No discrepancy, return original
  return ajmsData;
}

