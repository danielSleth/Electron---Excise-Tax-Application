# Electron---Excise-Tax-Application

Excise Tax Application

Developed by Daniel Sleth

Decenber 2018 - January 2019

An Electron Project

# Background

The finance department Landskrona Energi, my employer at the time, requested assistance in the
development of a procedure to ensure the correctness of current, and future, month excise tax 
reports with regards to the energy production operations of the company.

The procedure of calculating correct excise taxes for energy production in a Cogenerative Heating Plant,
is a complex process. Quotients, such as "auxiliary electricity supply" (electricity produced within
the plant to aid further production of heat, or electricity), have to be carefully calculated from
multiple sources of validated raw data, in order to be accurately determined. 

This raw data was, at the time of this request, spread out in a handful of different types of sources 
and thus the request for a centralized space for collecting this data was given, pending future 
reorganization of the data itself.

These quotinents are then multiplied by usage of fuel sources, and/or production of electricity and heat,
which are in turn multiplied by relevant tax rates for the fuel sources in question. This calculation
produces desired correct excise tax values for a given month.

# The Project

The application itself is the result of my first personal experience with Electron, with limited prior
background in working with Javascript. Through the result of trial and error, but with a relatively
clear vision of the desired outcome, things came to place with relative ease, after an initial period
of experimentation.

The result is an application split into three tabs. One for data entry, one for automatic calculation
of excise tax values, and one for automatic calculation of electricity certificate calculation. The 
user is asked to enter all the data for a given month into the data entry tab. Only when this process
is completed, can the user access the results of the calculation for this month in the excise tax tab. 

Sources for the different elements of the data entry tab are indicated as labels in relevant input fields.
The underlying data structure of the application is a two-dimensional JSON-array stored in a locally placed
.txt file, which is both imported and saved programmatically in .renderer.js 




