package com.expensify.backend.dto;
import com.expensify.backend.enums.AlertType;
public class LocationAlertResponse {
    private AlertType type; private String title; private String message; private String severity; private String source; private String startTime; private String endTime;
    public LocationAlertResponse(AlertType type,String title,String message,String severity,String source,String startTime,String endTime){this.type=type;this.title=title;this.message=message;this.severity=severity;this.source=source;this.startTime=startTime;this.endTime=endTime;}
    public AlertType getType(){return type;} public String getTitle(){return title;} public String getMessage(){return message;} public String getSeverity(){return severity;} public String getSource(){return source;} public String getStartTime(){return startTime;} public String getEndTime(){return endTime;}
}
