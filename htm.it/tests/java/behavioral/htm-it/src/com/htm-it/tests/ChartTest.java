/*
 * Numenta Platform for Intelligent Computing (NuPIC)
 * Copyright (C) 2015, Numenta, Inc.  Unless you have purchased from
 * Numenta, Inc. a separate commercial license for this software code, the
 * following terms and conditions apply:
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero Public License for more details.
 *
 * You should have received a copy of the GNU Affero Public License
 * along with this program.  If not, see http://www.gnu.org/licenses.
 *
 * http://numenta.org/licenses/
 *
 */

package com.htm.it.tests;

import com.htm-it.utils.TestUtilities;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.testng.Assert;

public class ChartTest {
    static By CHART_MENU = By.xpath("html/body/header/div/ul/li[2]/a");
    static By NO_DATA_FOUND_YET = By.xpath(".//*[@id='content']/div/div[2]/h3");
    static By DATAILED_MESSAGE_ON_CHART_PAGE = By.xpath(".//*[@id='content']/div/div[2]/p");
    static By MANAGE_MENU = By.xpath("html/body/header/div/ul/li[1]/a");
    static int WAIT_TIME = 20;

    public static void goToChartPageAndCheckMessage(WebDriver driver) {
        TestUtilities.waitClick(CHART_MENU, driver, WAIT_TIME);
        TestUtilities.waitClick(MANAGE_MENU, driver, WAIT_TIME);
    }
}
