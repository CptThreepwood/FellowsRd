resource "aws_api_gateway_rest_api" "booking_gateway" {
  name        = "${var.app_name}_gateway"
  description = "API Gateway for ${var.app_name} bookings"
}

resource "aws_api_gateway_authorizer" "cognito_auth" {
  name = "${var.app_name}_cognitoAuth"
  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"

  type = "COGNITO_USER_POOLS"
  provider_arns = ["${aws_cognito_user_pool.users.arn}"]
}

resource "aws_api_gateway_resource" "proxy_resource" {
  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"
  parent_id   = "${aws_api_gateway_rest_api.booking_gateway.root_resource_id}"
  path_part   = "bookings"
}

resource "aws_api_gateway_method" "CORS" {
  rest_api_id   = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id   = "${aws_api_gateway_resource.proxy_resource.id}"
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "CORS" {
  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id = "${aws_api_gateway_method.CORS.resource_id}"
  http_method = "${aws_api_gateway_method.CORS.http_method}"

  integration_http_method = "OPTIONS"
  type                    = "MOCK"
}

resource "aws_api_gateway_integration_response" "CORS" {
  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id = "${aws_api_gateway_method.CORS.resource_id}"
  http_method = "${aws_api_gateway_method.CORS.http_method}"

  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Methods" = "true"
    "method.response.header.Access-Control-Allow-Headers" = "true"
    "method.response.header.Access-Control-Allow-Origin" = "*"
  }
}

resource "aws_api_gateway_method_response" "CORS" {
  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id = "${aws_api_gateway_method.CORS.resource_id}"
  http_method = "${aws_api_gateway_method.CORS.http_method}"
  status_code = "${aws_api_gateway_integration_response.CORS.status_code}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method" "get_getBookings" {
  rest_api_id   = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id   = "${aws_api_gateway_resource.proxy_resource.id}"
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = "${aws_api_gateway_authorizer.cognito_auth.id}"

  request_parameters = {
    "method.request.querystring.startDate" = false
    "method.request.querystring.endDate" = false
  }
}

resource "aws_api_gateway_integration" "getBookings" {
  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id = "${aws_api_gateway_method.get_getBookings.resource_id}"
  http_method = "${aws_api_gateway_method.get_getBookings.http_method}"

  integration_http_method = "GET"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.getBookings.invoke_arn}"
}

resource "aws_api_gateway_method" "post_createBooking" {
  rest_api_id   = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id   = "${aws_api_gateway_resource.proxy_resource.id}"
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = "${aws_api_gateway_authorizer.cognito_auth.id}"
}

resource "aws_api_gateway_integration" "createBooking" {
  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"
  resource_id = "${aws_api_gateway_method.post_createBooking.resource_id}"
  http_method = "${aws_api_gateway_method.post_createBooking.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.createBooking.invoke_arn}"
}

resource "aws_api_gateway_deployment" "production" {
  depends_on = [
    "aws_api_gateway_integration.createBooking",
    "aws_api_gateway_integration.getBookings",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.booking_gateway.id}"
  stage_name  = "production"
}