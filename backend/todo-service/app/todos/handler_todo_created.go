package todos

import (
	"context"
	_ "embed"
	"encoding/json"
	"todo-service/app/constants"
	"todo-service/app/utils"
)

//go:embed schemas/todo.created.json
var todoCreatedSchema string

func (c *Controller) handleTodoCreated() {

	go func() {

		sub, err := c.js.PullSubscribe(
			constants.MessageTodoCreated,
			constants.DurableTodoCreated,
		)

		if err != nil {
			c.logger.Error().Err(err).Send()
			return
		}

		validator := utils.NewJSONSchemaValidator(todoCreatedSchema)

		for {
			ms, err := sub.Fetch(1)
			if err != nil {
				continue
			}

			m := ms[0]

			c.logger.Info().Msgf("message received (%s)", m.Subject)

			ves, err := validator.Validate(string(m.Data))

			if err != nil {
				c.logger.Error().Err(err).Send()
				continue
			}

			if 0 < len(ves) {
				c.logger.Warn().Msg("invalid message")
				for _, ve := range ves {
					c.logger.Warn().Msgf("validation error: %s", ve)
				}
				continue
			}

			todo := &todo{}

			if err := json.Unmarshal(m.Data, todo); err != nil {
				c.logger.Error().Err(err).Send()
				continue
			}

			command := &createTodoCommand{Todo: todo}

			if err := c.repository.createTodo(context.Background(), command); err != nil {
				c.logger.Error().Err(err).Send()
				continue
			}

			data, err := json.Marshal(todo)

			if err != nil {
				c.logger.Error().Err(err).Send()
				continue
			}

			if err := c.nc.Publish(constants.MessageTodoCreatedOk, data); err != nil {
				c.logger.Error().Err(err).Send()
				continue
			}

			m.Ack()
		}
	}()
}
